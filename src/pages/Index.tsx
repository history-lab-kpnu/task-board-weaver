
import React from 'react';
import BoardsList from '../components/BoardsList';
import KanbanBoard from '../components/KanbanBoard';
import { KanbanProvider } from '../context/KanbanContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

const Index = () => {
  const isMobile = useIsMobile();

  return (
    <KanbanProvider>
      <div className="flex flex-col h-screen bg-kanban-bg">
        <header className="bg-white border-b border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-kanban-primary">Kanban Board</h1>
            
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Menu className="h-4 w-4" />
                    <span className="ml-2">Boards</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[250px]">
                  <div className="h-full">
                    <BoardsList />
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </header>
        
        <div className="flex-1 overflow-hidden">
          <div className="flex h-full">
            {!isMobile && (
              <div className="w-60 flex-shrink-0">
                <BoardsList />
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <KanbanBoard />
            </div>
          </div>
        </div>
      </div>
    </KanbanProvider>
  );
};

export default Index;
