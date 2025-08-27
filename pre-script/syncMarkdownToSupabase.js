// syncMarkdownToSupabase.js
import * as fs from "fs/promises";
import * as path from "path";
import matter from "gray-matter";
import { createClient } from "@supabase/supabase-js";
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
if (!supabaseUrl || !supabaseKey) {
  throw new Error("SUPABASE_URL 또는 SUPABASE_KEY가 설정되지 않았습니다.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncMarkdownFiles() {
  console.log("syncMarkdownFiles");
  // 1.supbase내에서 가장 최근에 updated된 날짜 가져오기 ex)2025-03-04T01:14:02.000Z
  const maxUpdatedAt = await getMaxUpdatedAtInSupabase();
  console.log("maxUpdatedAt", maxUpdatedAt);

  // 2. 로컬에서 해당날짜 이후에 업데이트된 파일목록 가져오기
  const fileList = await getLocalFilesInfoAfterSupabaseUpdatedAt(new Date(0));
  console.log("fileList", fileList);

  // 3. 파일 임베딩 및 업데이트
  for (const file of fileList) {
    const embedding = await embedFile(file);
    await upsertToSupabase(file, embedding);
  }
}

/**
 * 1. 디렉토리 전체에서 .md 파일 경로와 OS 수정일만 추출
 */
async function getMdFilesWithOsUpdatedAt(folder: string) {
  const entries = await fs.readdir(folder, { withFileTypes: true });
  let result = [];

  for (const entry of entries) {
    const fullPath = path.join(folder, entry.name);

    if (entry.isDirectory()) {
      const subResult = await getMdFilesWithOsUpdatedAt(fullPath);
      result.push(...subResult);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      const stat = await fs.stat(fullPath);
      result.push({
        filePath: fullPath,
        osUpdatedAt: stat.mtime,
        filename: entry.name,
      });
    }
  }
  return result;
}

/**
 * 2. maxUpdatedAt 이후 파일만 내부 데이터 파싱
 */
async function getLocalFilesInfoAfterSupabaseUpdatedAt(maxUpdatedAt: Date) {
  const mdFiles = await getMdFilesWithOsUpdatedAt("./markdown");

  // OS 수정일 기준으로 필터링
  const filtered = mdFiles.filter((file) => {
    const returnval = maxUpdatedAt ? file.osUpdatedAt > maxUpdatedAt : true;
    return returnval;
  });

  // 내부 데이터 파싱
  const result = [];
  for (const file of filtered) {
    const raw = await fs.readFile(file.filePath, "utf-8");
    const parsed = matter(raw);
    const metadata = parsed.data;

    result.push({
      filename: metadata.title,
      filePath: file.filePath,
      excerpt: metadata.excerpt,
      thumbnail: metadata.thumbnail,
      path: metadata.path || file.filePath,
      title: metadata.title || file.filename,
      created_at: metadata.created_at,
      updated_at: metadata.updated_at,
      content: parsed.content,
      osUpdatedAt: file.osUpdatedAt,
    });
  }
  return result;
}


// 4. Embedding 함수

export async function embedFile(file) {
  // 1. 전처리: 제목과 요약 포함한 입력 텍스트 구성
  const embeddingInput = `제목: ${file.title}\n요약: ${file.excerpt}\n\n${file.content}`;

  // 2. OpenAI 임베딩 호출
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: embeddingInput,
  });

  const embedding = response.data[0].embedding;

  // 3. 임베딩 포함한 새로운 문서 객체 반환
  return embedding;
}

// 5. Supabase upsert
/**
 * fileMeta: 파일의 메타데이터(로컬/프론트매터 정보)
 * embedding: 임베딩 결과(예: 벡터 등)
 */
async function upsertToSupabase(fileMeta, embedding) {
  const { filePath,content, ...metadata } = fileMeta;

  if (!Array.isArray(embedding) ) {
    throw new Error("embedding 값이 올바른 float 배열이 아닙니다1.");
  }

  if ( embedding.some(v => typeof v !== "number" || isNaN(v))) {
    throw new Error("embedding 값이 올바른 float 배열이 아닙니다2.");
  }
  if (!metadata.path) {
    console.error(`path가 없는 파일: ${metadata.title || filePath}`);
    return;
  }
  // documents 테이블에 upsert
  const { error } = await supabase.from("documents").upsert([
    {
      content,
      metadata,
      embedding,
      updated_at: metadata.updated_at, // frontmatter의 updated_at을 컬럼에도 저장
      path: metadata.path,
    },
  ],{onConflict: "path"});

  if (error) {
    console.error(
      `업서트 실패 (${metadata.title || filePath}):`,
      //error.message
    );
  } else {
    console.log(`업서트 완료: ${metadata.title || filePath}`);
  }
}

/**
 * Supabase에서 max(updated_at) 구하기
 */
async function getMaxUpdatedAtInSupabase() {
  const { data, error } = await supabase
    .from("documents")
    .select("updated_at")
    .not("updated_at", "is", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("max updated_at 조회 실패:", error.message);
    return null;
  }

  return data?.updated_at ? new Date(data.updated_at) : null;
}

syncMarkdownFiles();
