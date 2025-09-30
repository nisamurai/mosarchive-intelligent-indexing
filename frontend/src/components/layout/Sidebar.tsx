import React from 'react';
import { useNavigation } from '../../hooks/useNavigation';
import { Button } from '../ui/button';
import { 
  Upload, 
  Settings, 
  FileText, 
  CheckCircle, 
  BarChart3, 
  TrendingUp
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { navigationState, goToStep, canGoToStep } = useNavigation();

  const menuItems = [
    { id: 'upload', title: 'Загрузка', icon: Upload, path: '/upload' },
    { id: 'preprocess', title: 'Предобработка', icon: Settings, path: '/preprocess' },
    { id: 'ocr', title: 'OCR', icon: FileText, path: '/ocr' },
    { id: 'verify', title: 'Верификация', icon: CheckCircle, path: '/verify' },
    { id: 'report', title: 'Отчёт', icon: BarChart3, path: '/report' },
    { id: 'statistics', title: 'Статистика', icon: TrendingUp, path: '/statistics' },
  ];

  return (
    <div className="w-64 bg-blue-200 shadow-lg h-full rounded-tr-2xl rounded-br-2xl">
      <div className="p-6 pt-6">
        {/* Меню навигации */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = navigationState.currentStep === item.id;
            const isCompleted = navigationState.completedSteps.includes(item.id as any);
            const isAccessible = canGoToStep(item.id as any);

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start ${
                  !isAccessible && !isActive 
                    ? 'text-gray-400 hover:text-gray-500 hover:bg-gray-50 cursor-not-allowed' 
                    : isAccessible && !isActive
                    ? 'text-gray-800 bg-blue-100'
                    : ''
                }`}
                onClick={() => isAccessible && goToStep(item.id as any)}
                disabled={!isAccessible && !isActive}
              >
                <IconComponent className={`w-4 h-4 mr-3 ${
                  !isAccessible && !isActive ? 'text-gray-600' : ''
                }`} />
                <span className={!isAccessible && !isActive ? 'text-gray-600' : ''}>
                  {item.title}
                </span>
                {isCompleted && (
                  <CheckCircle className="w-4 h-4 ml-auto text-green-600" />
                )}
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
