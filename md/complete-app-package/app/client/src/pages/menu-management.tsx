import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Edit2, GripVertical, Save, X, RotateCcw, Check } from 'lucide-react';
import { useUser } from '@/user-context';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface NavigationItem {
  id: string;
  name: string;
  path: string;
  icon?: string;
  permission?: string;
  subItems?: NavigationItem[];
  order: number;
}

interface EditingItem {
  id: string;
  name: string;
  type: 'main' | 'sub';
  parentId?: string;
}

// Define the current navigation structure based on the sidebar
const getDefaultNavigationStructure = (): NavigationItem[] => [
  {
    id: 'dashboard',
    name: 'Dashboard',
    path: '/dashboard',
    permission: 'dashboard',
    order: 1,
    subItems: [
      { id: 'finance-dashboard', name: 'Finance Dashboard', path: '/finance-dashboard', permission: 'financeDashboard', order: 1 },
      { id: 'sales-dashboard', name: 'Sales Dashboard', path: '/sales-dashboard', permission: 'salesDashboard', order: 2 }
    ]
  },
  {
    id: 'tender',
    name: 'Tender',
    path: '/tenders',
    permission: 'tender',
    order: 2,
    subItems: [
      { id: 'all-tenders', name: 'All Tenders', path: '/tenders', order: 1 },
      { id: 'import-tender', name: 'Import Tender', path: '/import-tender', order: 2 },
      { id: 'add-modify-tender', name: 'Add/Modify Tender', path: '/add-modify-tender', order: 3 },
      { id: 'tender-results', name: 'Tender Results', path: '/tender-results', permission: 'tenderResults', order: 4 }
    ]
  },
  {
    id: 'tender-task',
    name: 'Tender Task',
    path: '/tender-task',
    permission: 'tenderTask',
    order: 3,
    subItems: [
      { id: 'my-tender', name: 'My Tender', path: '/my-tenders', order: 1 },
      { id: 'assign-to-team', name: 'Assign to Team', path: '/assign-to-team', order: 2 },
      { id: 'submitted-tender', name: 'Submitted Tender', path: '/submitted-tenders', order: 3 },
      { id: 'tender-checklist', name: 'Tender Checklist', path: '/tender-checklist', order: 4 }
    ]
  },
  {
    id: 'finance',
    name: 'Finance Management',
    path: '/finance-management',
    permission: 'finance',
    order: 4,
    subItems: [
      { id: 'new-request', name: 'New Request', path: '/finance-management/new-request', permission: 'requestToFinanceTeam', order: 1 },
      { id: 'approve-request', name: 'Approve Request', path: '/finance-management/approve-request', permission: 'financeApproval', order: 2 },
      { id: 'denied-request', name: 'Denied Request', path: '/finance-management/denied-request', order: 3 },
      { id: 'complete-request', name: 'Complete Request', path: '/finance-management/complete-request', order: 4 }
    ]
  },
  {
    id: 'mis',
    name: 'MIS',
    path: '/mis',
    permission: 'mis',
    order: 5,
    subItems: [
      { id: 'finance-mis', name: 'Finance MIS', path: '/finance-mis', order: 1 },
      { id: 'sales-mis', name: 'Sales MIS', path: '/sales-mis', order: 2 },
      { id: 'login-mis', name: 'Login MIS', path: '/login-mis', order: 3 }
    ]
  },
  {
    id: 'documents',
    name: 'Document Management',
    path: '/documents',
    permission: 'folders',
    order: 6,
    subItems: [
      { id: 'folder-management', name: 'Folder Management', path: '/documents', order: 1 },
      { id: 'document-briefcase', name: 'Document Briefcase', path: '/document-brief-case', order: 2 }
    ]
  },
  {
    id: 'settings',
    name: 'Settings',
    path: '/settings',
    order: 7,
    subItems: [
      { id: 'department', name: 'Department', path: '/department', permission: 'department', order: 1 },
      { id: 'designation', name: 'Designation', path: '/designation', permission: 'designation', order: 2 },
      { id: 'role', name: 'Role', path: '/role', permission: 'role', order: 3 },
      { id: 'user-management', name: 'User Management', path: '/user-management', permission: 'userMaster', order: 4 },
      { id: 'general-settings', name: 'General Settings', path: '/general-settings', permission: 'admin', order: 5 },
      { id: 'menu-management', name: 'Menu Management', path: '/menu-management', permission: 'admin', order: 6 }
    ]
  }
];

function SortableMainItem({ item, isEditing, onEdit, onSave, onCancel, editingName, onNameChange, editingItem, handleEdit, handleSave, handleCancel }: {
  item: NavigationItem;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  editingName: string;
  onNameChange: (value: string) => void;
  editingItem: EditingItem | null;
  handleEdit: (itemId: string, type: 'main' | 'sub', parentId?: string) => void;
  handleSave: () => void;
  handleCancel: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <Input
                  value={editingName}
                  onChange={(e) => onNameChange(e.target.value)}
                  className="h-8"
                  autoFocus
                />
                <Button size="sm" onClick={onSave}>
                  <Save className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={onCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div>
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.path}</p>
              </div>
            )}
          </div>
          {!isEditing && (
            <div className="flex items-center space-x-2">
              {item.permission && (
                <Badge variant="outline" className="text-xs">
                  {item.permission}
                </Badge>
              )}
              <Badge variant="default" className="text-xs">
                Main Menu
              </Badge>
            </div>
          )}
        </div>
        {!isEditing && (
          <Button
            size="sm"
            variant="outline"
            onClick={onEdit}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {item.subItems && item.subItems.length > 0 && (
        <SortableContext items={item.subItems.map(sub => sub.id)} strategy={verticalListSortingStrategy}>
          <div className="ml-8 space-y-2 mt-3 border-l-2 border-gray-100 pl-4">
            {item.subItems.map((subItem) => (
              <SortableSubItem
                key={subItem.id}
                item={subItem}
                parentId={item.id}
                isEditing={editingItem?.id === subItem.id && editingItem?.type === 'sub'}
                onEdit={() => handleEdit(subItem.id, 'sub', item.id)}
                onSave={handleSave}
                onCancel={handleCancel}
                editingName={editingName}
                onNameChange={onNameChange}
              />
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  );
}

function SortableSubItem({ item, parentId, isEditing, onEdit, onSave, onCancel, editingName, onNameChange }: {
  item: NavigationItem;
  parentId: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  editingName: string;
  onNameChange: (value: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between py-2 bg-gray-50 rounded px-3">
      <div className="flex items-center space-x-3">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
        <div className="flex-1">
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <Input
                value={editingName}
                onChange={(e) => onNameChange(e.target.value)}
                className="h-8"
                autoFocus
              />
              <Button size="sm" onClick={onSave}>
                <Save className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div>
              <p className="font-medium text-sm">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.path}</p>
            </div>
          )}
        </div>
        {!isEditing && (
          <div className="flex items-center space-x-2">
            {item.permission && (
              <Badge variant="outline" className="text-xs">
                {item.permission}
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              Sub Menu
            </Badge>
          </div>
        )}
      </div>
      {!isEditing && (
        <Button
          size="sm"
          variant="outline"
          onClick={onEdit}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState<NavigationItem[]>([]);
  const [originalMenuItems, setOriginalMenuItems] = useState<NavigationItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [editingName, setEditingName] = useState('');
  const queryClient = useQueryClient();
  const { currentUser } = useUser();

  // Fetch current menu structure from API
  const { data: menuStructureData } = useQuery({
    queryKey: ['/api/menu-structure'],
    enabled: !!currentUser
  });

  // Initialize with current menu structure from API or fallback to default
  useEffect(() => {
    const currentStructure = menuStructureData?.menuStructure || getDefaultNavigationStructure();
    setMenuItems(currentStructure);
    setOriginalMenuItems(currentStructure);
  }, [menuStructureData]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const updateMutation = useMutation({
    mutationFn: async (menuStructure: NavigationItem[]) => {
      const userId = currentUser?.id ? currentUser.id.toString() : '2'; // Default to Poonam Amale (Admin)
      console.log('Current user:', currentUser, 'Using user ID:', userId);
      
      const response = await fetch('/api/menu-structure', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ menuStructure }),
      });
      if (!response.ok) throw new Error('Failed to update menu structure');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate the menu structure query to refresh the sidebar
      queryClient.invalidateQueries({ queryKey: ['/api/menu-structure'] });
      
      toast({ title: 'Menu structure updated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to update menu structure', variant: 'destructive' });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (menuStructure: NavigationItem[]) => {
      const userId = currentUser?.id ? currentUser.id.toString() : '2'; // Default to Poonam Amale (Admin)
      console.log('Save mutation - Current user:', currentUser, 'Using user ID:', userId);
      
      const response = await fetch('/api/menu-structure', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ menuStructure }),
      });
      if (!response.ok) throw new Error('Failed to save menu structure');
      return response.json();
    },
    onSuccess: () => {
      setOriginalMenuItems(menuItems);
      setHasChanges(false);
      
      // Invalidate the menu structure query to refresh the sidebar
      queryClient.invalidateQueries({ queryKey: ['/api/menu-structure'] });
      
      toast({ 
        title: 'Menu Structure Saved', 
        description: 'All changes have been applied to the main application menu.' 
      });
    },
    onError: () => {
      toast({ 
        title: 'Save Failed', 
        description: 'Failed to save menu structure. Please try again.',
        variant: 'destructive' 
      });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the items
    const activeItem = findItemById(activeId, menuItems);
    const overItem = findItemById(overId, menuItems);

    if (!activeItem || !overItem) return;

    // Handle reordering
    setMenuItems((items) => {
      const updatedItems = reorderItems(items, activeId, overId);
      // Mark as having changes but don't auto-save
      setHasChanges(true);
      return updatedItems;
    });
  };

  const findItemById = (id: string, items: NavigationItem[]): NavigationItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.subItems) {
        const found = findItemById(id, item.subItems);
        if (found) return found;
      }
    }
    return null;
  };

  const reorderItems = (items: NavigationItem[], activeId: string, overId: string): NavigationItem[] => {
    // Check if both items are at the same level
    const activeItemIndex = items.findIndex(item => item.id === activeId);
    const overItemIndex = items.findIndex(item => item.id === overId);

    if (activeItemIndex !== -1 && overItemIndex !== -1) {
      // Both are main menu items
      return arrayMove(items, activeItemIndex, overItemIndex).map((item, index) => ({
        ...item,
        order: index + 1
      }));
    }

    // Handle sub-menu reordering
    return items.map(item => {
      if (item.subItems) {
        const activeSubIndex = item.subItems.findIndex(sub => sub.id === activeId);
        const overSubIndex = item.subItems.findIndex(sub => sub.id === overId);

        if (activeSubIndex !== -1 && overSubIndex !== -1) {
          return {
            ...item,
            subItems: arrayMove(item.subItems, activeSubIndex, overSubIndex).map((subItem, index) => ({
              ...subItem,
              order: index + 1
            }))
          };
        }
      }
      return item;
    });
  };

  const handleEdit = (itemId: string, type: 'main' | 'sub', parentId?: string) => {
    const item = findItemById(itemId, menuItems);
    if (item) {
      setEditingItem({ id: itemId, name: item.name, type, parentId });
      setEditingName(item.name);
    }
  };

  const handleSave = () => {
    if (!editingItem) return;

    setMenuItems(prevItems => {
      const updateItemName = (items: NavigationItem[]): NavigationItem[] => {
        return items.map(item => {
          if (item.id === editingItem.id) {
            return { ...item, name: editingName };
          }
          if (item.subItems) {
            return { ...item, subItems: updateItemName(item.subItems) };
          }
          return item;
        });
      };

      const updatedItems = updateItemName(prevItems);
      // Mark as having changes but don't auto-save
      setHasChanges(true);
      return updatedItems;
    });

    setEditingItem(null);
    setEditingName('');
  };

  const handleCancel = () => {
    setEditingItem(null);
    setEditingName('');
  };

  const handleReset = () => {
    setMenuItems(originalMenuItems);
    setHasChanges(false);
    setEditingItem(null);
    setEditingName('');
    toast({ 
      title: 'Menu Reset', 
      description: 'All changes have been reverted to the last saved state.' 
    });
  };

  const handleSaveChanges = () => {
    if (!hasChanges) {
      toast({ 
        title: 'No Changes', 
        description: 'There are no changes to save.' 
      });
      return;
    }
    saveMutation.mutate(menuItems);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground">Manage navigation menu structure with drag & drop reordering</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleReset}
            variant="outline"
            disabled={!hasChanges || saveMutation.isPending}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </Button>
          <Button
            onClick={handleSaveChanges}
            disabled={!hasChanges || saveMutation.isPending}
            className="flex items-center space-x-2"
          >
            <Check className="h-4 w-4" />
            <span>Save Changes</span>
          </Button>
          {hasChanges && (
            <Badge variant="secondary" className="text-sm">
              Unsaved Changes
            </Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Menu Structure</span>
            <p className="text-sm text-muted-foreground font-normal">
              Drag menu items to reorder • Click edit icon to rename
            </p>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={menuItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {menuItems.map((item) => (
                  <SortableMainItem
                    key={item.id}
                    item={item}
                    isEditing={editingItem?.id === item.id && editingItem?.type === 'main'}
                    onEdit={() => handleEdit(item.id, 'main')}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    editingName={editingName}
                    onNameChange={setEditingName}
                    editingItem={editingItem}
                    handleEdit={handleEdit}
                    handleSave={handleSave}
                    handleCancel={handleCancel}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          
          {menuItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Loading navigation structure...
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h4 className="font-medium text-blue-900">How to use Menu Management:</h4>
            <ul className="text-sm text-blue-800 space-y-1 ml-4">
              <li>• <strong>Drag & Drop:</strong> Click and drag the grip icon (⋮⋮) to reorder menu items</li>
              <li>• <strong>Rename:</strong> Click the edit icon to rename any menu item</li>
              <li>• <strong>Auto-Save:</strong> Changes are automatically saved when you make them</li>
              <li>• <strong>Sub-menus:</strong> Sub-menu items can also be reordered within their parent menu</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}