import React from 'react';
import { IUser } from '@shared/mongodb-schema';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Check, X, RefreshCw, Trash2, User, Edit } from 'lucide-react';
import { format } from 'date-fns';

interface AdminTableProps {
  admins: IUser[];
  type: 'pending' | 'all';
  onApprove?: (id: string, approved: boolean) => void;
  onReactivate?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (admin: IUser) => void;
  loading?: boolean;
}

export function AdminTable({ 
  admins, 
  type, 
  onApprove, 
  onReactivate, 
  onDelete, 
  onEdit,
  loading = false 
}: AdminTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading admins...</span>
      </div>
    );
  }

  if (!admins || admins.length === 0) {
    return (
      <div className="text-center p-8">
        <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {type === 'pending' ? 'No Pending Admins' : 'No Admins Found'}
        </h3>
        <p className="text-gray-500">
          {type === 'pending' 
            ? 'All admin requests have been processed.' 
            : 'No administrators have been created yet.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      <div className="space-y-4">
        {admins.map((admin) => (
          <div 
            key={admin._id} 
            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            data-testid={`admin-card-${admin._id}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {admin.firstName} {admin.lastName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {admin.email}
                    </p>
                    <p className="text-xs text-gray-400">
                      @{admin.username}
                    </p>
                  </div>
                </div>
                
                <div className="mt-2 flex items-center space-x-2">
                  <Badge 
                    variant={admin.isApproved ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {admin.isApproved ? "Approved" : "Pending"}
                  </Badge>
                  <Badge 
                    variant={admin.isActive ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {admin.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {admin.role}
                  </Badge>
                </div>

                <div className="mt-1 text-xs text-gray-500">
                  Created: {format(new Date(admin.createdAt), 'MMM dd, yyyy')}
                </div>
              </div>

              <div className="flex-shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" data-testid={`admin-actions-${admin._id}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {type === 'pending' && onApprove && (
                      <>
                        <DropdownMenuItem 
                          onClick={() => onApprove(admin._id, true)}
                          data-testid={`approve-admin-${admin._id}`}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onApprove(admin._id, false)}
                          data-testid={`reject-admin-${admin._id}`}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    {type === 'all' && (
                      <>
                        {onEdit && (
                          <DropdownMenuItem 
                            onClick={() => onEdit(admin)}
                            data-testid={`edit-admin-${admin._id}`}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {!admin.isActive && onReactivate && (
                          <DropdownMenuItem 
                            onClick={() => onReactivate(admin._id)}
                            data-testid={`reactivate-admin-${admin._id}`}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reactivate
                          </DropdownMenuItem>
                        )}
                        {onDelete && admin.role !== 'super_admin' && (
                          <DropdownMenuItem 
                            onClick={() => onDelete(admin._id)}
                            className="text-red-600"
                            data-testid={`delete-admin-${admin._id}`}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}