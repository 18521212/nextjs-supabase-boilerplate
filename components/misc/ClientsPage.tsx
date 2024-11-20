'use client'

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { getClients, getProjectsByClientId } from '@/utils/supabase/queries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Pagination } from '@/components/ui/pagination';
import { DEFAULT_ITEMS_PER_PAGE } from '@/utils/constants';
import { useTenant } from '@/utils/tenant-context';
import { toast } from '@/components/ui/use-toast';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface ClientsPageProps {
  user: User;
}

export default function ClientsPage({ user }: ClientsPageProps) {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [totalItems, setTotalItems] = useState(0);
  const router = useRouter();
  const { currentTenant } = useTenant();

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [clientProjects, setClientProjects] = useState<any[]>([]);
  
  useEffect(() => {
    if (currentTenant) {
      loadClients();
    }
  }, [currentPage, itemsPerPage, currentTenant]);

  async function loadClients() {
    try {
      setLoading(true);
      const supabase = createClient();
      const { clients, count } = await getClients(supabase, currentTenant!.id, currentPage, itemsPerPage);
      if (clients) {
        setClients(clients);
        setTotalItems(count || 0);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      toast({
        title: "Error",
        description: "Failed to load clients. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  if (!currentTenant) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-semibold">No Tenant Selected</h2>
          <p className="text-muted-foreground">Please select a tenant from your account settings.</p>
          <Button 
            className="mt-4"
            onClick={() => router.push('/account')}
          >
            Go to Account Settings
          </Button>
        </div>
      </div>
    );
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const handleViewDetails = async (e: React.MouseEvent, client: Record<string, any>) => {
    e.stopPropagation();
    setSelectedClient(client);
    
    try {
      const supabase = createClient();
      const projects = await getProjectsByClientId(supabase, currentTenant!.id, client.id);
      setClientProjects(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setClientProjects([]);
    }
    
    setIsDetailOpen(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (

    <div className="container mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Client List</CardTitle>
          <Link href="/clients/add">
            <Button variant="default">+ Add New</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="text-left bg-muted">
                <th className="p-2">Name</th>
                <th className="p-2">Client Code</th>
                <th className="p-2">Address</th>
                <th className="p-2">Country</th>
                <th className="p-2">Active</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients?.map((client) => (
                <tr 
                  key={client.id} 
                  className="border-b hover:bg-muted/50 cursor-pointer"
                  onClick={() => router.push(`/clients/edit/${client.id}`)}
                >
                  <td className="p-2">{client.name}</td>
                  <td className="p-2">{client.client_code}</td>
                  <td className="p-2">{client.address}</td>
                  <td className="p-2">{client.country_code_iso_2}</td>
                  <td className="p-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                      client.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {client.is_active ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="p-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleViewDetails(e, client)}
                  >
                    View Details
                  </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/clients/edit/${client.id}`);
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Client Details</DialogTitle>
              </DialogHeader>
              
              {selectedClient && (
                <div className="space-y-6">
                  {/* Client Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-sm">Name</h3>
                      <p>{selectedClient.name}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Client Code</h3>
                      <p>{selectedClient.client_code}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Address</h3>
                      <p>{selectedClient.address}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Country</h3>
                      <p>{selectedClient.country_code_iso_2}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Status</h3>
                      <Badge variant={selectedClient.is_active ? "default" : "destructive"}>
                        {selectedClient.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>

                  {/* Projects Section */}
                  <div>
                    <h3 className="font-semibold mb-3">Projects</h3>
                    {clientProjects.length > 0 ? (
                      <div className="border rounded-lg">
                        <table className="w-full">
                          <thead className="bg-muted">
                            <tr>
                              <th className="p-2 text-left">Project Name</th>
                              <th className="p-2 text-left">Start Date</th>
                              <th className="p-2 text-left">End Date</th>
                              <th className="p-2 text-left">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {clientProjects.map((project) => (
                              <tr key={project.id} className="border-t">
                                <td className="p-2">{project.name}</td>
                                <td className="p-2">{new Date(project.start_date).toLocaleDateString()}</td>
                                <td className="p-2">
                                  {project.end_date 
                                    ? new Date(project.end_date).toLocaleDateString()
                                    : "Ongoing"
                                  }
                                </td>
                                <td className="p-2">
                                  <Badge variant={
                                    project.status === "completed" ? "default" :
                                    project.status === "in_progress" ? "default" :
                                    "secondary"
                                  }>
                                    {project.status?.replace("_", " ") || "Unknown"}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No projects found</p>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}