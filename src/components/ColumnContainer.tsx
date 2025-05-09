
import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Column } from '../types/kanban';
import TaskCard from './TaskCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useKanban } from '../context/KanbanContext';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MoreVertical, Plus, X } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ColumnContainerProps {
  column: Column;
}

const ColumnContainer: React.FC<ColumnContainerProps> = ({ column }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  const { activeBoard, updateColumn, deleteColumn, addTask } = useKanban();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [columnTitle, setColumnTitle] = useState(column.title);

  const handleAddTask = () => {
    if (activeBoard && newTaskTitle.trim()) {
      addTask(activeBoard.id, column.id, newTaskTitle, newTaskDescription);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setIsAddingTask(false);
    }
  };

  const handleUpdateColumnTitle = () => {
    if (activeBoard && columnTitle.trim()) {
      updateColumn(activeBoard.id, column.id, columnTitle);
      setIsEditingTitle(false);
    }
  };

  const handleDeleteColumn = () => {
    if (activeBoard) {
      deleteColumn(activeBoard.id, column.id);
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="w-[280px] h-full flex-shrink-0"
    >
      <div className="bg-kanban-column rounded-md shadow-sm flex flex-col h-full">
        {/* Column Header */}
        <div 
          className="p-3 flex items-center justify-between border-b bg-gray-50 rounded-t-md"
          {...attributes}
          {...listeners}
        >
          {isEditingTitle ? (
            <div className="flex items-center gap-2 w-full">
              <Input
                value={columnTitle}
                onChange={(e) => setColumnTitle(e.target.value)}
                autoFocus
                className="text-sm font-medium"
                onBlur={handleUpdateColumnTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUpdateColumnTitle();
                  }
                }}
              />
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-muted-foreground"
                onClick={() => setIsEditingTitle(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <h3 className="text-sm font-medium truncate">
                {column.title} <span className="text-gray-400 text-xs">({column.tasks.length})</span>
              </h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-muted-foreground"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditingTitle(true)}>
                    Edit title
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleDeleteColumn}
                    className="text-red-500 focus:text-red-500"
                  >
                    Delete column
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>

        {/* Column Content */}
        <div className="flex-1 overflow-y-auto p-2">
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} columnId={column.id} />
          ))}
        </div>

        {/* Column Footer */}
        <div className="p-2 border-t">
          {isAddingTask ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-muted-foreground text-sm hover:text-foreground"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add a task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 mt-2">
                  <Input
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Task title"
                    autoFocus
                  />
                  <Textarea
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    placeholder="Add a description..."
                    className="min-h-[100px]"
                  />
                </div>
                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setIsAddingTask(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddTask}>Add Task</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground text-sm hover:text-foreground"
              onClick={() => setIsAddingTask(true)}
            >
              <Plus className="h-4 w-4 mr-1" /> Add a task
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ColumnContainer;
