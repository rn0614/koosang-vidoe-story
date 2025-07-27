'use client';

import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Car, Package } from 'lucide-react';
import { useCallback, useState, useEffect } from 'react';
import { sendWebViewMessage, isWebView } from '@/utils/mobile-router';

export default function Page() {
  const [isWebViewEnv, setIsWebViewEnv] = useState(false);

  useEffect(() => {
    setIsWebViewEnv(isWebView());
  }, []);

  const handleMenuClick = useCallback(
    (e: React.MouseEvent, href: string) => {
      if (isWebViewEnv) {
        e.preventDefault();
        sendWebViewMessage({ href });
      }
    },
    [isWebViewEnv],
  );

  const menuItems = [
    {
      href: '/3d/car3D',
      labelKey: 'car3D',
      icon: Car,
      description: '3D 자동차 모델을 확인해보세요',
    },
    {
      href: '/3d/container',
      labelKey: 'container',
      icon: Package,
      description: '3D 컨테이너 시뮬레이션을 체험해보세요',
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">3D 메뉴</h1>
        <p className="text-gray-600 dark:text-gray-400">
          원하는 3D 기능을 선택해주세요
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <div key={item.href}>
              {isWebViewEnv ? (
                <Card 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={(e) => handleMenuClick(e, item.href)}
                >
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-2">
                      <IconComponent size={48} className="text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">
                      {item.labelKey}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                      {item.description}
                    </p>
                    <Button className="w-full">
                      선택하기
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Link href={item.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="text-center">
                      <div className="flex justify-center mb-2">
                        <IconComponent size={48} className="text-blue-600" />
                      </div>
                      <CardTitle className="text-xl">
                        {item.labelKey}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                        {item.description}
                      </p>
                      <Button className="w-full">
                        선택하기
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}