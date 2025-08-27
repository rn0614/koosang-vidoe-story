import { useState, useMemo } from 'react';

// 태그 트리 생성
function buildTagTree(tags: string[]) {
  const tree: any = {};
  tags.forEach((tagPath) => {
    const parts = tagPath.split('/');
    let node = tree;
    for (const part of parts) {
      if (!node[part]) node[part] = {};
      node = node[part];
    }
  });
  return tree;
}

// 상위 태그의 하위 태그 목록 구하기
function getChildTags(tree: any, path: string | null) {
  if (!path) return Object.keys(tree);
  const parts = path.split('/');
  let node = tree;
  for (const part of parts) {
    if (!node[part]) return [];
    node = node[part];
  }
  return Object.keys(node);
}

export function useTagFilter(documents: any[]) {
  // 모든 태그
  const allTags = useMemo(
    () =>
      Array.from(new Set(documents.flatMap((doc) => doc.metadata?.tags ?? []))),
    [documents],
  );
  const tagTree = useMemo(() => buildTagTree(allTags), [allTags]);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  // 선택된 모든 태그를 포함하는 문서만 필터링
  const filteredDocuments = useMemo(
    () =>
      selectedTags.length > 0
        ? documents.filter((doc) =>
            selectedTags.every((selected) =>
              (doc.metadata?.tags ?? []).some(
                (tag: string) =>
                  tag === selected || tag.startsWith(selected + '/'),
              ),
            ),
          )
        : documents,
    [documents, selectedTags],
  );

  // filteredDocuments에서 모든 태그 추출
  const tagsInFilteredDocs = useMemo(
    () => new Set(filteredDocuments.flatMap((doc) => doc.metadata?.tags ?? [])),
    [filteredDocuments],
  );

  // 각 선택된 태그의 하위 태그 중, 실제로 존재하는 것만 추출
  function getExistingChildTags(
    selectedTags: string[],
    tagTree: any,
    tagsInDocs: Set<string>,
  ) {
    let result: string[] = [];
    selectedTags.forEach((selected) => {
      const children = getChildTags(tagTree, selected);
      children.forEach((child) => {
        const fullPath = selected + '/' + child;
        if (tagsInDocs.has(fullPath)) {
          result.push(fullPath);
        }
      });
    });
    return result;
  }

  // filteredDocuments에서 태그 목록 추출
  const visibleTags = useMemo(
    () =>
      Array.from(
        new Set(filteredDocuments.flatMap((doc) => doc.metadata?.tags ?? [])),
      ),
    [filteredDocuments],
  );

  // displayTags 계산
  let displayTags: string[] = [];
  if (selectedTags.length === 0) {
    displayTags = Object.keys(tagTree);
  } else {
    const childTags = getExistingChildTags(
      selectedTags,
      tagTree,
      tagsInFilteredDocs,
    );
    displayTags = [
      ...selectedTags,
      ...childTags,
      ...visibleTags.filter(
        (tag) => !selectedTags.includes(tag) && !childTags.includes(tag),
      ),
    ];
    displayTags = Array.from(new Set(displayTags));
  }

  return {
    selectedTags,
    setSelectedTags,
    toggleTag,
    displayTags,
    filteredDocuments,
  };
}

// 현재 글들에 대한 태그 내용 검색
export async function getTagCount() {
  const res = await fetch('/api/documents/tag');
  const data = await res.json();
  return data.tags;
}
