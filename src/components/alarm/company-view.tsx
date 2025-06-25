import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuestionTemplates } from '@/hooks/useQuestionTemplates';
import { CompanySelect } from '@/components/alarm/company-select';
import { QuestionTemplateCreateForm } from '@/components/alarm/question-template-create-form';
import { QuestionTemplateList } from '@/components/alarm/question-template-list';
import { CustomerResponseStatus } from '@/components/alarm/customer-response-status';

// CompanyView Props 타입 정의
export interface CompanyViewProps {
  companies: any[];
  companiesLoading: boolean;
  companiesError: boolean;
  companiesErrorObj: any;
  onSendNow?: (template: any, company: any) => void;
  onCompanyChange?: (company: any) => void;
}

export const CompanyView: React.FC<CompanyViewProps> = ({
  companies,
  companiesLoading,
  companiesError,
  companiesErrorObj,
  onCompanyChange,
}) => {
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  useEffect(() => {
    if (companies && companies.length > 0 && !selectedCompany) {
      setSelectedCompany(companies[0]);
      if (onCompanyChange) onCompanyChange(companies[0]);
    }
  }, [companies]);

  const handleCompanyChange = (value: string) => {
    const company = companies.find((c: any) => c.id.toString() === value);
    setSelectedCompany(company);
    if (onCompanyChange) onCompanyChange(company);
  };

  // 질문 템플릿 fetch (회사별)
  const {
    data: questionTemplates = [],
    isLoading: templatesLoading,
    isError: templatesError,
    error: templatesErrorObj,
    refetch: refetchTemplates,
  } = useQuestionTemplates(selectedCompany?.id);

  return (
    <div className="space-y-6">
      {/* 회사 선택 */}
      <Card>
        <CardHeader>
          <CardTitle>회사 선택</CardTitle>
        </CardHeader>
        <CardContent>
          {companiesLoading ? (
            <div className="text-center py-4">로딩 중...1</div>
          ) : companiesError ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                에러: {typeof companiesErrorObj === 'object' && companiesErrorObj && 'message' in companiesErrorObj ? (companiesErrorObj as any).message : String(companiesErrorObj)}
              </AlertDescription>
            </Alert>
          ) : (
            <CompanySelect
              companies={companies}
              selectedCompany={selectedCompany}
              onChange={handleCompanyChange}
            />
          )}
        </CardContent>
      </Card>

      {/* 템플릿 생성 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">➕ 새 건강 체크 질문 템플릿 만들기</CardTitle>
          <CardDescription>고객들에게 주기적으로 발송할 건강 체크 질문을 생성합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <QuestionTemplateCreateForm
            companyId={selectedCompany?.id}
            onCreated={refetchTemplates}
            loading={templatesLoading}
          />
        </CardContent>
      </Card>

      {/* 템플릿 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>활성 질문 템플릿</CardTitle>
          <CardDescription>현재 사용 중인 건강 체크 질문 템플릿 목록입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          {templatesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-muted-foreground">템플릿을 불러오는 중...</p>
            </div>
          ) : templatesError ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                에러: {typeof templatesErrorObj === 'object' && templatesErrorObj && 'message' in templatesErrorObj ? (templatesErrorObj as any).message : String(templatesErrorObj)}
              </AlertDescription>
            </Alert>
          ) : (
            <QuestionTemplateList
              templates={questionTemplates}
              companyId={selectedCompany?.id}
            />
          )}
        </CardContent>
      </Card>

      {/* 고객 응답 현황 */}
      <Card>
        <CardHeader>
          <CardTitle>고객 응답 현황</CardTitle>
          <CardDescription>고객들의 실시간 응답을 확인할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerResponseStatus companyId={selectedCompany?.id} />
        </CardContent>
      </Card>
    </div>
  );
};