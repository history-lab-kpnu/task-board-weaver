import React, { useState } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useKanban } from '../context/KanbanContext';
import ColumnContainer from './ColumnContainer';
import TaskCard from './TaskCard';
import { Column, Task } from '../types/kanban';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

const KanbanBoard: React.FC = () => {
  const { activeBoard, addColumn, moveTask, moveColumn } = useKanban();
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<{task: Task, columnId: string} | null>(null);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [addingColumn, setAddingColumn] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const { data } = active;
    
    console.log('⭐ Drag Start:', {
      active,
      activeId: active.id,
      type: data?.current?.type,
      containerId: data?.current?.sortable?.containerId
    });

    if (data?.current?.type === 'column') {
      setActiveColumn(data.current.column);
    } else if (data?.current?.type === 'task') {
      const task = data.current.task;
      const columnId = data.current?.sortable?.containerId;
      if (task && columnId) {
        setActiveTask({ task, columnId });
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    console.log('🔄 Drag Over:', {
      active: {
        id: active.id,
        type: active.data.current?.type,
        containerId: active.data.current?.sortable?.containerId
      },
      over: over ? {
        id: over.id,
        type: over.data.current?.type,
        containerId: over.data.current?.sortable?.containerId
      } : 'No over element'
    });
    
    if (!over || !activeBoard) return;
    
    const activeId = active.id;
    const overId = over.id;
    
    // If the active and over items are the same, do nothing
    if (activeId === overId) return;
    
    // Handle task movement between columns
    const isActiveTask = active.data.current?.type === 'task';
    const isOverTask = over.data.current?.type === 'task';
    const isOverColumn = over.data.current?.type === 'column';
    
    if (!isActiveTask) return;
    
    // If we're dragging a task over another task
    if (isActiveTask && isOverTask) {
      // Get the column IDs
      const activeColumnId = active.data.current?.sortable?.containerId;
      // Виправляємо тут - беремо containerId з over (потрібно знати, до якої колонки належить цільовий таск)
      const overColumnId = over.data.current?.sortable?.containerId;
      
      console.log('📌 Dragging between tasks:', { 
        activeColumnId, 
        overColumnId,
        activeTaskId: activeId,
        overTaskId: overId
      });
      
      if (!activeColumnId || !overColumnId) return;
      
      // Find the indices
      const activeColumnIndex = activeBoard.columns.findIndex(col => col.id === activeColumnId);
      const overColumnIndex = activeBoard.columns.findIndex(col => col.id === overColumnId);
      
      // Check if columns exist
      if (activeColumnIndex === -1 || overColumnIndex === -1) return;
      
      const activeColumn = activeBoard.columns[activeColumnIndex];
      const overColumn = activeBoard.columns[overColumnIndex];
      
      if (!activeColumn || !overColumn) return;
      
      const activeTaskIndex = activeColumn.tasks.findIndex(
        task => task.id === activeId
      );
      const overTaskIndex = overColumn.tasks.findIndex(
        task => task.id === overId
      );
      
      // Check if tasks exist
      if (activeTaskIndex === -1 || overTaskIndex === -1) return;
      
      // If the task is dragged within the same column
      if (activeColumnId === overColumnId) {
        moveTask(
          activeBoard.id,
          activeColumnId,
          activeColumnId,
          activeTaskIndex,
          overTaskIndex
        );
      }
      // If the task is dragged to a different column
      else {
        moveTask(
          activeBoard.id,
          activeColumnId,
          overColumnId,
          activeTaskIndex,
          overTaskIndex
        );
      }
    }
    
    // If we're dragging a task over a column
    if (isActiveTask && isOverColumn) {
      const activeColumnId = active.data.current?.sortable?.containerId;
      const overColumnId = overId as string;
      
      if (!activeColumnId || !overColumnId) return;
      
      const activeColumnIndex = activeBoard.columns.findIndex(col => col.id === activeColumnId);
      const overColumnIndex = activeBoard.columns.findIndex(col => col.id === overColumnId);
      
      if (activeColumnIndex === -1 || overColumnIndex === -1) return;
      
      const activeColumn = activeBoard.columns[activeColumnIndex];
      const overColumn = activeBoard.columns[overColumnIndex];
      
      if (!activeColumn || !overColumn) return;
      
      const activeTaskIndex = activeColumn.tasks.findIndex(
        task => task.id === activeId
      );
      
      if (activeTaskIndex === -1) return;
      
      // Add the task to the end of the column
      moveTask(
        activeBoard.id,
        activeColumnId,
        overColumnId,
        activeTaskIndex,
        overColumn.tasks.length
      );
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    console.log('🏁 Drag End (FULL):', event);
    console.log('🏁 Drag End:', {
      active: {
        id: active.id,
        type: active.data.current?.type,
        containerId: active.data.current?.sortable?.containerId
      },
      over: over ? {
        id: over.id,
        type: over.data.current?.type,
        containerId: over.data.current?.sortable?.containerId
      } : 'No over element'
    });
    
    if (!over || !activeBoard) {
      setActiveColumn(null);
      setActiveTask(null);
      return;
    }
    
    const activeId = active.id;
    const overId = over.id;
    
    if (activeId === overId) {
      setActiveColumn(null);
      setActiveTask(null);
      return;
    }
    
    // Handle column reordering
    const isActiveColumn = active.data.current?.type === 'column';
    const isActiveTask = active.data.current?.type === 'task';
    const isOverColumn = over.data.current?.type === 'column';
    const isOverTask = over.data.current?.type === 'task';
    
    if (isActiveColumn && activeBoard) {
      const activeColumnIndex = activeBoard.columns.findIndex(col => col.id === activeId);
      const overColumnIndex = activeBoard.columns.findIndex(col => col.id === overId);
      
      if (activeColumnIndex !== -1 && overColumnIndex !== -1) {
        moveColumn(activeBoard.id, activeColumnIndex, overColumnIndex);
      }
    }
    
    // Додаємо логіку для обробки кінця перетягування таска на колонку
    if (isActiveTask && isOverColumn) {
      const activeColumnId = active.data.current?.sortable?.containerId;
      const overColumnId = overId as string;
      
      if (!activeColumnId || !overColumnId) {
        setActiveColumn(null);
        setActiveTask(null);
        return;
      }
      
      const activeColumnIndex = activeBoard.columns.findIndex(col => col.id === activeColumnId);
      const overColumnIndex = activeBoard.columns.findIndex(col => col.id === overColumnId);
      
      if (activeColumnIndex === -1 || overColumnIndex === -1) {
        setActiveColumn(null);
        setActiveTask(null);
        return;
      }
      
      const activeColumn = activeBoard.columns[activeColumnIndex];
      const overColumn = activeBoard.columns[overColumnIndex];
      
      if (!activeColumn || !overColumn) {
        setActiveColumn(null);
        setActiveTask(null);
        return;
      }
      
      const activeTaskIndex = activeColumn.tasks.findIndex(
        task => task.id === activeId
      );
      
      if (activeTaskIndex === -1) {
        setActiveColumn(null);
        setActiveTask(null);
        return;
      }
      
      console.log('📦 Moving Task:', {
        boardId: activeBoard.id,
        fromColumnId: activeColumnId,
        toColumnId: overColumnId,
        taskIndex: activeTaskIndex,
        toPosition: overColumn.tasks.length,
        task: activeId
      });
      
      moveTask(
        activeBoard.id,
        activeColumnId,
        overColumnId,
        activeTaskIndex,
        overColumn.tasks.length
      );
      
      console.log('✅ Task Move Completed');
    }
    
    // Обробляємо перетягування таску на інший таск в (можливо) іншій колонці
    if (isActiveTask && isOverTask) {
      const activeColumnId = active.data.current?.sortable?.containerId;
      // Виправляємо тут - використовуємо containerId з over
      const overColumnId = over.data.current?.sortable?.containerId;
      
      console.log('📦 Task to Task End:', {
        activeColumnId,
        overColumnId,
        activeTaskId: activeId,
        overTaskId: overId
      });
      
      if (!activeColumnId || !overColumnId) {
        setActiveColumn(null);
        setActiveTask(null);
        return;
      }
      
      const activeColumnIndex = activeBoard.columns.findIndex(col => 
        // Шукаємо колонку за ID або за ідентифікатором Sortable
        col.id === activeColumnId || `Sortable-${activeBoard.columns.indexOf(col)}` === activeColumnId
      );
      
      const overColumnIndex = activeBoard.columns.findIndex(col => 
        col.id === overColumnId || `Sortable-${activeBoard.columns.indexOf(col)}` === overColumnId
      );
      
      console.log('📊 Column Indices:', { activeColumnIndex, overColumnIndex });
      
      if (activeColumnIndex === -1 || overColumnIndex === -1) {
        setActiveColumn(null);
        setActiveTask(null);
        return;
      }
      
      const activeColumn = activeBoard.columns[activeColumnIndex];
      const overColumn = activeBoard.columns[overColumnIndex];
      
      if (!activeColumn || !overColumn) {
        setActiveColumn(null);
        setActiveTask(null);
        return;
      }
      
      const activeTaskIndex = activeColumn.tasks.findIndex(
        task => task.id === activeId
      );
      
      const overTaskIndex = overColumn.tasks.findIndex(
        task => task.id === overId
      );
      
      if (activeTaskIndex === -1 || overTaskIndex === -1) {
        setActiveColumn(null);
        setActiveTask(null);
        return;
      }
      
      console.log('📦 Moving Task between columns:', {
        boardId: activeBoard.id,
        fromColumnId: activeColumn.id,
        toColumnId: overColumn.id,
        taskIndex: activeTaskIndex,
        toPosition: overTaskIndex,
        task: activeId
      });
      
      // Переміщення таску
      moveTask(
        activeBoard.id,
        activeColumn.id,
        overColumn.id,
        activeTaskIndex,
        overTaskIndex
      );
    }
    
    setActiveColumn(null);
    setActiveTask(null);
  };

  const handleAddColumn = () => {
    if (activeBoard && newColumnTitle.trim()) {
      addColumn(activeBoard.id, newColumnTitle);
      setNewColumnTitle('');
      setAddingColumn(false);
    }
  };

  if (!activeBoard) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Board Selected</h2>
          <p className="text-gray-500">Please select or create a board to start.</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 overflow-x-auto h-full p-4">
        <div className="flex h-full gap-4">
          <SortableContext 
            items={activeBoard?.columns?.map(col => col.id) || []} 
            strategy={horizontalListSortingStrategy}
          >
            {activeBoard?.columns.map(column => (
              <ColumnContainer 
                key={column.id} 
                column={column} 
              />
            ))}
          </SortableContext>

          {addingColumn ? (
            <div className="w-[280px] flex-shrink-0">
              <div className="bg-kanban-column rounded-md shadow-sm p-3">
                <Input
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  placeholder="Enter column title"
                  className="mb-2"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddColumn();
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button onClick={handleAddColumn}>Add</Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setAddingColumn(false);
                      setNewColumnTitle('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button 
              onClick={() => setAddingColumn(true)} 
              variant="outline" 
              className="flex-shrink-0 h-12 mt-10"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Column
            </Button>
          )}
        </div>
      </div>

      <DragOverlay>
        {activeColumn && (
          <div className="w-[280px] opacity-70">
            <ColumnContainer column={activeColumn} />
          </div>
        )}
        {activeTask && (
          <div className="w-[280px] opacity-70">
            <TaskCard task={activeTask.task} columnId={activeTask.columnId} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;
