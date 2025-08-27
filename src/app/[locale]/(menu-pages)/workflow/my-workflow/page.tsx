"use client";
import React, { useEffect, useState } from 'react';
import { Link } from '@/shared/lib/i18n/navigation';

export default function WorkflowCreatePage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [myWorkflows, setMyWorkflows] = useState<any[]>([]);
  const [approvalWorkflows, setApprovalWorkflows] = useState<any[]>([]);

  // 템플릿 목록 불러오기
  useEffect(() => {
    fetch('/api/workflow/template')
      .then(res => res.json())
      .then(data => setTemplates(data.templates || []));
  }, []);

  // 내 워크플로우, 승인자로 포함된 워크플로우 불러오기
  useEffect(() => {
    fetch('/api/workflow/my-workflow')
      .then(res => res.json())
      .then(data => {
        setMyWorkflows(data.workflow || []);
        setApprovalWorkflows(data.approval || []);
      });
  }, []);

  // 템플릿 선택 시 이름 자동 입력
  useEffect(() => {
    if (selectedTemplate) setName(selectedTemplate.name || '');
  }, [selectedTemplate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) {
      setResult('템플릿을 선택하세요.');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/workflow/my-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          workflow: selectedTemplate.template, // template 컬럼을 workflow로 저장
          template_id:selectedTemplate.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult('내 워크플로우로 저장 성공!');
      } else {
        setResult(data.error || '저장 실패');
      }
    } catch (err) {
      setResult('에러: ' + (err as any)?.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-8 bg-white dark:bg-zinc-900 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">템플릿에서 내 워크플로우 생성</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold dark:text-gray-200">템플릿 선택</label>
          <select
            className="w-full border rounded px-2 py-1 bg-white dark:bg-zinc-800 dark:text-gray-100 dark:border-zinc-700"
            value={selectedTemplate?.id || ''}
            onChange={e => {
              const tpl = templates.find(t => String(t.id) === e.target.value);
              setSelectedTemplate(tpl || null);
            }}
            required
          >
            <option value="">-- 템플릿을 선택하세요 --</option>
            {templates.map(tpl => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-semibold dark:text-gray-200">이름</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border rounded px-2 py-1 bg-white dark:bg-zinc-800 dark:text-gray-100 dark:border-zinc-700"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? '저장중...' : '내 워크플로우로 저장'}
        </button>
      </form>
      {result && <div className="mt-4 text-center font-semibold dark:text-gray-100">{result}</div>}

      {/* 내 워크플로우 리스트 */}
      <div className="mt-10">
        <h3 className="text-lg font-bold mb-2 dark:text-gray-100">내 워크플로우</h3>
        {myWorkflows.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400">내 워크플로우가 없습니다.</div>
        ) : (
          <ul className="space-y-2">
            {myWorkflows.map(wf => (
              <li key={wf.id} className="border rounded px-3 py-2 bg-white hover:bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-700 transition">
                <Link href={`/workflow/${wf.id}`} className="block">
                  <div className="font-semibold dark:text-white">{wf.name}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-400">생성일: {wf.created_at}</div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 내가 승인자로 포함된 워크플로우 리스트 */}
      <div className="mt-10">
        <h3 className="text-lg font-bold mb-2 dark:text-gray-100">내가 승인자로 포함된 워크플로우</h3>
        {approvalWorkflows.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400">승인자로 포함된 워크플로우가 없습니다.</div>
        ) : (
          <ul className="space-y-2">
            {approvalWorkflows.map(wf => (
              <li key={wf.id} className="border rounded px-3 py-2 bg-white dark:bg-zinc-800 dark:border-zinc-700">
                <div className="font-semibold dark:text-white">{wf.name}</div>
                <div className="text-xs text-gray-400 dark:text-gray-400">생성일: {wf.created_at}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 