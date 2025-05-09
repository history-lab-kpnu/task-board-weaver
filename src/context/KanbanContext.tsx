
import React, { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { Board, Column, Task } from '../types/kanban';

// Mock initial data
const initialBoards: Board[] = [
  {
    id: uuidv4(),
    title: 'My First Board',
    columns: [
      {
        id: uuidv4(),
        title: 'To Do',
        tasks: [
          {
            id: uuidv4(),
            title: 'Research competitors',
            description: 'Look at similar products and take notes',
            createdAt: new Date(),
          },
          {
            id: uuidv4(),
            title: 'Sketch wireframes',
            description: 'Create initial wireframes for the main screens',
            createdAt: new Date(),
          },
        ],
      },
      {
        id: uuidv4(),
        title: 'In Progress',
        tasks: [
          {
            id: uuidv4(),
            title: 'Design user interface',
            description: 'Create UI design based on wireframes',
            createdAt: new Date(),
          },
        ],
      },
      {
        id: uuidv4(),
        title: 'Done',
        tasks: [
          {
            id: uuidv4(),
            title: 'Project initialization',
            description: 'Set up the project repository and environment',
            createdAt: new Date(),
          },
        ],
      },
    ],
  },
];

interface KanbanContextType {
  boards: Board[];
  activeBoard: Board | null;
  setActiveBoard: (board: Board) => void;
  addBoard: (title: string) => void;
  updateBoard: (boardId: string, title: string) => void;
  deleteBoard: (boardId: string) => void;
  addColumn: (boardId: string, title: string) => void;
  updateColumn: (boardId: string, columnId: string, title: string) => void;
  deleteColumn: (boardId: string, columnId: string) => void;
  addTask: (boardId: string, columnId: string, title: string, description: string) => void;
  updateTask: (boardId: string, columnId: string, taskId: string, title: string, description: string) => void;
  deleteTask: (boardId: string, columnId: string, taskId: string) => void;
  moveTask: (boardId: string, sourceColumnId: string, destinationColumnId: string, sourceIndex: number, destinationIndex: number) => void;
  moveColumn: (boardId: string, sourceIndex: number, destinationIndex: number) => void;
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined);

export const KanbanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [boards, setBoards] = useState<Board[]>(() => {
    // Load from localStorage if available
    const savedBoards = localStorage.getItem('kanban-boards');
    return savedBoards ? JSON.parse(savedBoards) : initialBoards;
  });
  
  const [activeBoard, setActiveBoard] = useState<Board | null>(null);

  useEffect(() => {
    // Set first board as active by default if not already set
    if (boards.length > 0 && !activeBoard) {
      setActiveBoard(boards[0]);
    } else if (boards.length === 0) {
      setActiveBoard(null);
    }
  }, [boards, activeBoard]);

  useEffect(() => {
    // Save to localStorage whenever boards change
    localStorage.setItem('kanban-boards', JSON.stringify(boards));
  }, [boards]);

  const addBoard = (title: string) => {
    const newBoard: Board = {
      id: uuidv4(),
      title,
      columns: [],
    };
    setBoards([...boards, newBoard]);
    setActiveBoard(newBoard);
    toast.success(`Board "${title}" created`);
  };

  const updateBoard = (boardId: string, title: string) => {
    const updatedBoards = boards.map(board =>
      board.id === boardId ? { ...board, title } : board
    );
    setBoards(updatedBoards);
    
    if (activeBoard?.id === boardId) {
      setActiveBoard({ ...activeBoard, title });
    }
    
    toast.success(`Board renamed to "${title}"`);
  };

  const deleteBoard = (boardId: string) => {
    const boardTitle = boards.find(board => board.id === boardId)?.title;
    const updatedBoards = boards.filter(board => board.id !== boardId);
    setBoards(updatedBoards);
    
    if (activeBoard?.id === boardId) {
      setActiveBoard(updatedBoards.length > 0 ? updatedBoards[0] : null);
    }
    
    toast.success(`Board "${boardTitle}" deleted`);
  };

  const addColumn = (boardId: string, title: string) => {
    const updatedBoards = boards.map(board => {
      if (board.id === boardId) {
        const newColumn: Column = {
          id: uuidv4(),
          title,
          tasks: [],
        };
        return {
          ...board,
          columns: [...board.columns, newColumn],
        };
      }
      return board;
    });
    
    setBoards(updatedBoards);
    
    if (activeBoard?.id === boardId) {
      const updatedBoard = updatedBoards.find(board => board.id === boardId);
      if (updatedBoard) setActiveBoard(updatedBoard);
    }
    
    toast.success(`Column "${title}" added`);
  };

  const updateColumn = (boardId: string, columnId: string, title: string) => {
    const updatedBoards = boards.map(board => {
      if (board.id === boardId) {
        return {
          ...board,
          columns: board.columns.map(column =>
            column.id === columnId ? { ...column, title } : column
          ),
        };
      }
      return board;
    });
    
    setBoards(updatedBoards);
    
    if (activeBoard?.id === boardId) {
      const updatedBoard = updatedBoards.find(board => board.id === boardId);
      if (updatedBoard) setActiveBoard(updatedBoard);
    }
    
    toast.success(`Column renamed to "${title}"`);
  };

  const deleteColumn = (boardId: string, columnId: string) => {
    const updatedBoards = boards.map(board => {
      if (board.id === boardId) {
        const columnTitle = board.columns.find(col => col.id === columnId)?.title;
        return {
          ...board,
          columns: board.columns.filter(column => column.id !== columnId),
        };
      }
      return board;
    });
    
    setBoards(updatedBoards);
    
    if (activeBoard?.id === boardId) {
      const updatedBoard = updatedBoards.find(board => board.id === boardId);
      if (updatedBoard) setActiveBoard(updatedBoard);
    }
    
    toast.success(`Column deleted`);
  };

  const addTask = (boardId: string, columnId: string, title: string, description: string) => {
    const updatedBoards = boards.map(board => {
      if (board.id === boardId) {
        return {
          ...board,
          columns: board.columns.map(column => {
            if (column.id === columnId) {
              const newTask: Task = {
                id: uuidv4(),
                title,
                description,
                createdAt: new Date(),
              };
              return {
                ...column,
                tasks: [...column.tasks, newTask],
              };
            }
            return column;
          }),
        };
      }
      return board;
    });
    
    setBoards(updatedBoards);
    
    if (activeBoard?.id === boardId) {
      const updatedBoard = updatedBoards.find(board => board.id === boardId);
      if (updatedBoard) setActiveBoard(updatedBoard);
    }
    
    toast.success(`Task "${title}" added`);
  };

  const updateTask = (boardId: string, columnId: string, taskId: string, title: string, description: string) => {
    const updatedBoards = boards.map(board => {
      if (board.id === boardId) {
        return {
          ...board,
          columns: board.columns.map(column => {
            if (column.id === columnId) {
              return {
                ...column,
                tasks: column.tasks.map(task =>
                  task.id === taskId ? { ...task, title, description } : task
                ),
              };
            }
            return column;
          }),
        };
      }
      return board;
    });
    
    setBoards(updatedBoards);
    
    if (activeBoard?.id === boardId) {
      const updatedBoard = updatedBoards.find(board => board.id === boardId);
      if (updatedBoard) setActiveBoard(updatedBoard);
    }
    
    toast.success(`Task updated`);
  };

  const deleteTask = (boardId: string, columnId: string, taskId: string) => {
    const updatedBoards = boards.map(board => {
      if (board.id === boardId) {
        return {
          ...board,
          columns: board.columns.map(column => {
            if (column.id === columnId) {
              return {
                ...column,
                tasks: column.tasks.filter(task => task.id !== taskId),
              };
            }
            return column;
          }),
        };
      }
      return board;
    });
    
    setBoards(updatedBoards);
    
    if (activeBoard?.id === boardId) {
      const updatedBoard = updatedBoards.find(board => board.id === boardId);
      if (updatedBoard) setActiveBoard(updatedBoard);
    }
    
    toast.success(`Task deleted`);
  };

  const moveTask = (
    boardId: string,
    sourceColumnId: string,
    destinationColumnId: string,
    sourceIndex: number,
    destinationIndex: number
  ) => {
    const updatedBoards = boards.map(board => {
      if (board.id === boardId) {
        // Get the source and destination columns
        const sourceColumn = board.columns.find(col => col.id === sourceColumnId);
        const destinationColumn = board.columns.find(col => col.id === destinationColumnId);

        if (!sourceColumn || !destinationColumn) return board;

        // Create new arrays to avoid mutation
        const newSourceTasks = [...sourceColumn.tasks];
        const taskToMove = newSourceTasks[sourceIndex];
        
        // Remove task from source
        newSourceTasks.splice(sourceIndex, 1);
        
        // Same column movement or different column
        let newDestinationTasks;
        if (sourceColumnId === destinationColumnId) {
          // Same column, reuse the source tasks array
          newDestinationTasks = newSourceTasks;
        } else {
          // Different column, create a copy of the destination tasks
          newDestinationTasks = [...destinationColumn.tasks];
        }
        
        // Insert the task at the destination index
        newDestinationTasks.splice(destinationIndex, 0, taskToMove);
        
        // Create updated columns
        const updatedColumns = board.columns.map(column => {
          if (column.id === sourceColumnId) {
            return {
              ...column,
              tasks: sourceColumnId === destinationColumnId ? newDestinationTasks : newSourceTasks
            };
          } 
          if (column.id === destinationColumnId) {
            return {
              ...column,
              tasks: newDestinationTasks
            };
          }
          return column;
        });
        
        return {
          ...board,
          columns: updatedColumns,
        };
      }
      return board;
    });
    
    setBoards(updatedBoards);
    
    if (activeBoard?.id === boardId) {
      const updatedBoard = updatedBoards.find(board => board.id === boardId);
      if (updatedBoard) setActiveBoard(updatedBoard);
    }
  };

  const moveColumn = (boardId: string, sourceIndex: number, destinationIndex: number) => {
    const updatedBoards = boards.map(board => {
      if (board.id === boardId) {
        const columns = [...board.columns];
        const [removed] = columns.splice(sourceIndex, 1);
        columns.splice(destinationIndex, 0, removed);
        
        return {
          ...board,
          columns,
        };
      }
      return board;
    });
    
    setBoards(updatedBoards);
    
    if (activeBoard?.id === boardId) {
      const updatedBoard = updatedBoards.find(board => board.id === boardId);
      if (updatedBoard) setActiveBoard(updatedBoard);
    }
  };

  return (
    <KanbanContext.Provider
      value={{
        boards,
        activeBoard,
        setActiveBoard,
        addBoard,
        updateBoard,
        deleteBoard,
        addColumn,
        updateColumn,
        deleteColumn,
        addTask,
        updateTask,
        deleteTask,
        moveTask,
        moveColumn,
      }}
    >
      {children}
    </KanbanContext.Provider>
  );
};

export const useKanban = () => {
  const context = useContext(KanbanContext);
  if (!context) {
    throw new Error('useKanban must be used within a KanbanProvider');
  }
  return context;
};
