import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Organization, OrganizationInput, OrganizationUpdateInput } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';

// Mock organizations data
const mockOrganizations: Organization[] = [
  {
    id: '1',
    name: 'Grace North',
    description: 'Grace North',
    createdBy: '1',
    createdAt: new Date().toISOString(),
    members: ['1', '2'],
    groups: ['1']
  },
  {
    id: '2',
    name: 'Grace Central',
    description: 'Grace Central',
    createdBy: '2',
    createdAt: new Date().toISOString(),
    members: ['1', '2'],
    groups: ['2']
  }
];

interface OrganizationContextType {
  organizations: Organization[];
  loading: boolean;
  createOrganization: (organization: OrganizationInput) => Promise<string>;
  getOrganization: (id: string) => Organization | undefined;
  updateOrganization: (id: string, organization: OrganizationUpdateInput) => Promise<void>;
  deleteOrganization: (id: string) => Promise<void>;
  addGroupToOrganization: (organizationId: string, groupId: string) => Promise<void>;
  removeGroupFromOrganization: (organizationId: string, groupId: string) => Promise<void>;
  addMemberToOrganization: (organizationId: string, userId: string) => Promise<void>;
  removeMemberFromOrganization: (organizationId: string, userId: string) => Promise<void>;
  inviteMemberToOrganization: (organizationId: string, email: string) => Promise<void>;
  getUserOrganizations: () => Organization[];
}

const OrganizationContext = createContext<OrganizationContextType | null>(null);

export const OrganizationProvider = ({ children }: { children: ReactNode }) => {
  const [organizations, setOrganizations] = useState<Organization[]>(mockOrganizations);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  useEffect(() => {
    setLoading(false);
  }, []);

  const createOrganization = async (organizationInput: OrganizationInput): Promise<string> => {
    setLoading(true);
    try {
      if (!currentUser) throw new Error('You must be logged in to create an organization');
      const newOrganization: Organization = {
        ...organizationInput,
        id: String(organizations.length + 1),
        createdBy: currentUser.id,
        createdAt: new Date().toISOString(),
        groups: [],
        members: [currentUser.id],
      };
      setOrganizations([...organizations, newOrganization]);
      toast({ title: "Organization created", description: `${newOrganization.name} has been created successfully` });
      return newOrganization.id;
    } catch (error) {
      toast({ title: "Failed to create organization", description: error instanceof Error ? error.message : "An unknown error occurred", variant: "destructive" });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getOrganization = (id: string) => organizations.find(organization => organization.id === id);

  const updateOrganization = async (id: string, updatedData: OrganizationUpdateInput) => {
    setLoading(true);
    try {
      if (!currentUser) throw new Error('You must be logged in to update an organization');
      const organization = organizations.find(o => o.id === id);
      if (!organization) throw new Error('Organization not found');
      if (currentUser.role !== 'admin' && organization.createdBy !== currentUser.id) throw new Error('You do not have permission');
      setOrganizations(organizations.map(o => o.id === id ? { ...o, ...updatedData } : o));
      toast({ title: "Organization updated", description: `${organization.name} has been updated successfully` });
    } catch (error) {
      toast({ title: "Failed to update organization", description: error instanceof Error ? error.message : "An unknown error occurred", variant: "destructive" });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteOrganization = async (id: string) => {
    setLoading(true);
    try {
      if (!currentUser) throw new Error('You must be logged in');
      const org = organizations.find(o => o.id === id);
      if (!org) throw new Error('Not found');
      if (currentUser.role !== 'admin' && org.createdBy !== currentUser.id) throw new Error('No permission');
      setOrganizations(organizations.filter(o => o.id !== id));
      toast({ title: "Deleted", description: `${org.name} has been deleted` });
    } catch (error) {
      toast({ title: "Failed to delete", description: error instanceof Error ? error.message : "An unknown error occurred", variant: "destructive" });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addGroupToOrganization = async (organizationId: string, groupId: string) => {
    setLoading(true);
    try {
      if (!currentUser) throw new Error('Login required');
      const org = organizations.find(o => o.id === organizationId);
      if (!org) throw new Error('Not found');
      if (!org.members.includes(currentUser.id)) throw new Error('Must be member');
      if (org.groups.includes(groupId)) throw new Error('Already added');
      setOrganizations(organizations.map(o => o.id === organizationId ? { ...o, groups: [...o.groups, groupId] } : o));
      toast({ title: "Group added", description: `Group added to ${org.name}` });
    } catch (error) {
      toast({ title: "Failed", description: error instanceof Error ? error.message : "An unknown error occurred", variant: "destructive" });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeGroupFromOrganization = async (organizationId: string, groupId: string) => {
    setLoading(true);
    try {
      if (!currentUser) throw new Error('Login required');
      const org = organizations.find(o => o.id === organizationId);
      if (!org) throw new Error('Not found');
      if (currentUser.role !== 'admin' && org.createdBy !== currentUser.id) throw new Error('No permission');
      setOrganizations(organizations.map(o => o.id === organizationId ? { ...o, groups: o.groups.filter(g => g !== groupId) } : o));
      toast({ title: "Group removed", description: `Group removed from ${org.name}` });
    } catch (error) {
      toast({ title: "Failed", description: error instanceof Error ? error.message : "An unknown error occurred", variant: "destructive" });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addMemberToOrganization = async (organizationId: string, userId: string) => {
    setLoading(true);
    try {
      if (!currentUser) throw new Error('Login required');
      const org = organizations.find(o => o.id === organizationId);
      if (!org) throw new Error('Not found');
      if (currentUser.role !== 'admin' && org.createdBy !== currentUser.id) throw new Error('No permission');
      if (org.members.includes(userId)) throw new Error('Already a member');
      setOrganizations(organizations.map(o => o.id === organizationId ? { ...o, members: [...o.members, userId] } : o));
      toast({ title: "Member added", description: `User added to ${org.name}` });
    } catch (error) {
      toast({ title: "Failed", description: error instanceof Error ? error.message : "An unknown error occurred", variant: "destructive" });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const inviteMemberToOrganization = async (organizationId: string, email: string) => {
    setLoading(true);
    try {
      if (!currentUser) throw new Error('Login required');
      const org = organizations.find(o => o.id === organizationId);
      if (!org) throw new Error('Not found');
      if (currentUser.role !== 'admin' && org.createdBy !== currentUser.id) throw new Error('No permission');
      // Simulated invite process
      toast({ title: "Invitation sent", description: `Invitation sent to ${email} for ${org.name}` });
    } catch (error) {
      toast({ title: "Invite failed", description: error instanceof Error ? error.message : "An unknown error occurred", variant: "destructive" });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeMemberFromOrganization = async (organizationId: string, userId: string) => {
    setLoading(true);
    try {
      if (!currentUser) throw new Error('Login required');
      const org = organizations.find(o => o.id === organizationId);
      if (!org) throw new Error('Not found');
      if (currentUser.role !== 'admin' && org.createdBy !== currentUser.id) throw new Error('No permission');
      if (org.createdBy === userId) throw new Error('Cannot remove creator');
      setOrganizations(organizations.map(o => o.id === organizationId ? { ...o, members: o.members.filter(m => m !== userId) } : o));
      toast({ title: "Member removed", description: `User removed from ${org.name}` });
    } catch (error) {
      toast({ title: "Failed", description: error instanceof Error ? error.message : "An unknown error occurred", variant: "destructive" });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getUserOrganizations = () => currentUser ? organizations.filter(org => org.members.includes(currentUser.id) || org.createdBy === currentUser.id) : [];

  const value = {
    organizations,
    loading,
    createOrganization,
    getOrganization,
    updateOrganization,
    deleteOrganization,
    addGroupToOrganization,
    removeGroupFromOrganization,
    addMemberToOrganization,
    removeMemberFromOrganization,
    inviteMemberToOrganization,
    getUserOrganizations
  };

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
};

export const useOrganizations = () => {
  const context = useContext(OrganizationContext);
  if (!context) throw new Error('useOrganizations must be used within an OrganizationProvider');
  return context;
};
