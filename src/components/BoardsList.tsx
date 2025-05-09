
import React, { useState } from 'react';
import { useKanban } from '../context/KanbanContext';
import { Board } from '../types/kanban';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical } from 'lucide-react';

const BoardsList: React.FC = () => {
  const { boards, activeBoard, setActiveBoard, addBoard, updateBoard, deleteBoard } = useKanban();
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [isAddingBoard, setIsAddingBoard] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);

  const handleAddBoard = () => {
    if (newBoardTitle.trim()) {
      addBoard(newBoardTitle.trim());
      setNewBoardTitle('');
      setIsAddingBoard(false);
    }
  };

  const handleUpdateBoard = (boardId: string, title: string) => {
    if (title.trim()) {
      updateBoard(boardId, title.trim());
      setEditingBoard(null);
    }
  };

  return (
    <div className="bg-gray-50 border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Your Boards</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsAddingBoard(true)} 
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-1">
          {boards.map((board) => (
            <div 
              key={board.id} 
              className={`flex justify-between items-center px-3 py-2 rounded-md ${
                activeBoard?.id === board.id 
                  ? 'bg-kanban-primary text-white' 
                  : 'hover:bg-gray-100 cursor-pointer'
              }`}
              onClick={() => setActiveBoard(board)}
            >
              <span className="truncate">{board.title}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`h-8 w-8 p-0 ${
                      activeBoard?.id === board.id ? 'text-white hover:bg-kanban-secondary' : ''
                    }`}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    setEditingBoard(board);
                  }}>
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteBoard(board.id);
                    }}
                    className="text-red-500 focus:text-red-500"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
          
          {boards.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No boards yet. Create your first board!
            </div>
          )}
        </div>
      </div>

      {/* Add Board Dialog */}
      <Dialog open={isAddingBoard} onOpenChange={setIsAddingBoard}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Board</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Input
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              placeholder="Board title"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddBoard();
                }
              }}
            />
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsAddingBoard(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBoard}>Create Board</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Board Dialog */}
      <Dialog open={!!editingBoard} onOpenChange={(open) => !open && setEditingBoard(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Board</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {editingBoard && (
              <Input
                value={editingBoard.title}
                onChange={(e) => setEditingBoard({...editingBoard, title: e.target.value})}
                placeholder="Board title"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && editingBoard) {
                    handleUpdateBoard(editingBoard.id, editingBoard.title);
                  }
                }}
              />
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setEditingBoard(null)}>
              Cancel
            </Button>
            <Button 
              onClick={() => editingBoard && handleUpdateBoard(editingBoard.id, editingBoard.title)}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BoardsList;
