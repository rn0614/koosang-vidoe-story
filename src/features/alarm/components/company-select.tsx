import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';

interface CompanySelectProps {
  companies: any[];
  selectedCompany: any;
  onChange: (companyId: string) => void;
}

export function CompanySelect({ companies, selectedCompany, onChange }: CompanySelectProps) {
  return (
    <Select value={selectedCompany?.id?.toString() || ''} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="회사를 선택하세요" />
      </SelectTrigger>
      <SelectContent>
        {companies.map((company: any) => (
          <SelectItem key={company.id} value={company.id.toString()}>
            {company.name} ({company.type})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
