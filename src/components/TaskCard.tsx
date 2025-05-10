import React, { useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../types/kanban';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useKanban } from '../context/KanbanContext';
import { useState } from 'react';

interface TaskCardProps {
  task: Task;
  columnId: string;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, columnId }) => {
  useEffect(() => {
    console.log('TaskCard mounted:', {
      id: task.id,
      title: task.title,
      columnId
    });
  }, [task, columnId]);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
      sortable: {
        containerId: columnId,
      },
    },
  });

  const { activeBoard, updateTask, deleteTask } = useKanban();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [isOpen, setIsOpen] = useState(false);

  const handleUpdateTask = () => {
    if (activeBoard && title.trim()) {
      updateTask(activeBoard.id, columnId, task.id, title, description);
      setIsEditing(false);
      setIsOpen(false);
    }
  };

  const handleDeleteTask = () => {
    if (activeBoard) {
      deleteTask(activeBoard.id, columnId, task.id);
      setIsOpen(false);
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          className="mb-3 touch-none"
        >
          <Card className="hover:border-kanban-primary transition-colors">
            <CardContent className="p-3">
              <h3 className="text-sm font-medium mb-1">{task.title}</h3>
              {task.description && (
                <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>
              )}
            </CardContent>
            <CardFooter className="px-3 py-2 border-t bg-gray-50 text-xs text-gray-500">
              {task.createdAt instanceof Date
                ? task.createdAt.toLocaleDateString(undefined, dateOptions)
                : new Date(task.createdAt).toLocaleDateString(undefined, dateOptions)}
            </CardFooter>
          </Card>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                className="font-medium"
                autoFocus
              />
            </div>
          ) : (
            <DialogTitle>{task.title}</DialogTitle>
          )}
          <DialogDescription>
            {isEditing ? (
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
                className="min-h-[100px]"
              />
            ) : (
              <p className="mt-2 whitespace-pre-wrap">
                {task.description || "No description"}
              </p>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          {isEditing ? (
            <div className="flex flex-col-reverse sm:flex-row sm:space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(false)} className="mt-2 sm:mt-0">
                Cancel
              </Button>
              <Button onClick={handleUpdateTask}>Save changes</Button>
            </div>
          ) : (
            <div className="flex flex-col-reverse sm:flex-row sm:space-x-2">
              <Button variant="destructive" onClick={handleDeleteTask} className="mt-2 sm:mt-0">
                Delete
              </Button>
              <Button onClick={() => setIsEditing(true)}>Edit</Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskCard;
