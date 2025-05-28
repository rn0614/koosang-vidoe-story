import { redirect } from 'next/navigation';
import React from 'react';

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
  type: 'error' | 'success',
  path: string,
  message: string,
) {
  return redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

function decodeHtml(htmlText: string) {
  // 확장된 HTML 엔티티 목록
  const entities: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&#39;': "'",
    '&grave;': '`',
    '&nbsp;': ' ',
    '&ndash;': '-',
    '&mdash;': '—',
    '&hyphen;': '-',
    '&lowbar;': '_',
    '&ast;': '*',
    '&Hat;': '^',
    '&dollar;': '$',
    '&percnt;': '%',
    '&lpar;': '(',
    '&rpar;': ')',
    '&plus;': '+',
    '&equals;': '=',
    '&lbrack;': '[',
    '&rbrack;': ']',
    '&lbrace;': '{',
    '&rbrace;': '}',
    '&verbar;': '|',
    '&bsol;': '\\',
    '&colon;': ':',
    '&semi;': ';',
    '&comma;': ',',
    '&period;': '.',
    '&quest;': '?',
    '&excl;': '!',
  };
  // 숫자 참조 엔티티 (&#123;) 처리
  let result = htmlText.replace(/&#(\d+);/g, (match, num) =>
    String.fromCharCode(num),
  );

  // 16진수 참조 엔티티 (&#x7B;) 처리
  result = result.replace(/&#x([0-9a-f]+);/gi, (match, hex) =>
    String.fromCharCode(parseInt(hex, 16)),
  );

  // 명명된 엔티티 (&amp;) 처리
  result = result.replace(
    /&[a-zA-Z0-9#]+;/g,
    (match) => entities[match] || match,
  );

  return result.trim();
}

export async function extractLinks(url: string, linkRegex: RegExp): Promise<{ links: { url: string; text: string }[] }> {
  // 1. fetch로 html 가져오기
  const res = await fetch(url);
  const htmlText = await res.text();

  // 2. 링크 추출 및 디코딩
  // const linkRegex = /<li><a href="(https?:\/\/[^\"]+)"[^>]*>([^<]+)<\/a>\s*\[[^\]]+\]\s*(?!(?:<a href="\/bruticle\/[^>]+>|\[<a href="ㅎ\\https?:\/\/news\\.youcomvinator\\.com[^>]+>\]))/g;
  let match;
  const result = {
    links: [] as { url: string; text: string }[],
  };

  while ((match = linkRegex.exec(htmlText)) !== null) {
    const url = match[1];
    const text = decodeHtml(match[2]);
    result.links.push({ url, text });
  }

  // 최종 결과 출력
  console.log(`Total links extracted: ${result.links.length}`);
  console.log(JSON.stringify([result], null, 2));

  return result;
}
