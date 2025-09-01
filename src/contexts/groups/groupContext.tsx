
import { createContext, useState, ReactNode, useEffect } from 'react';
import { Group, Message, SongTransposition } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { GroupContextType } from './types';
import { mockGroups, mockMessages } from './mockData';
import { 
  createGroupActions, 
  createSongActions, 
  createMemberActions, 
  createMessageActions, 
  createQueryActions 
} from './groupActions';

// Create Context
const GroupContext = createContext<GroupContextType | null>(null);

// Provider Component
export const GroupProvider = ({ children }: { children: ReactNode }) => {
  const [groups, setGroups] = useState<Group[]>(mockGroups);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  useEffect(() => {
    // Simulate API call to fetch groups
    setLoading(false);
  }, []);

  // Group management actions
  const { 
    createGroup, 
    getGroup, 
    updateGroup, 
    deleteGroup 
  } = createGroupActions(groups, setGroups, currentUser, toast, setLoading);

  // Song management actions
  const { 
    addSongToGroup, 
    removeSongFromGroup 
  } = createSongActions(groups, setGroups, currentUser, toast, setLoading);

  // Member management actions
  const { 
    addMemberToGroup, 
    removeMemberFromGroup 
  } = createMemberActions(groups, setGroups, currentUser, toast, setLoading);

  // Message management actions
  const { 
    sendMessage, 
    getGroupMessages 
  } = createMessageActions(messages, setMessages, groups, currentUser, toast);

  // Query actions
  const { 
    getOrganizationGroups 
  } = createQueryActions(groups);
  
  // Implement getGroups function
  const getGroups = (filters: { organizationId?: string } = {}) => {
    if (filters && filters.organizationId) {
      return groups.filter(group => group.organizationId === filters.organizationId);
    }
    return groups;
  };

  // Add updateSongTransposition function
  const updateSongTransposition = async (
    groupId: string,
    songId: string,
    transposition: number,
    useFlats: boolean = false
  ) => {
    setLoading(true);
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to update song transposition');
      }

      const group = groups.find(g => g.id === groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      // Check if user is a member of this group
      if (!group.members.includes(currentUser.id)) {
        throw new Error('You must be a member of the group to update song transposition');
      }

      // Create songTranspositions array if it doesn't exist
      const songTranspositions = group.songTranspositions || [];
      
      // Find existing transposition entry for this song
      const existingIndex = songTranspositions.findIndex(t => t.songId === songId);
      
      if (existingIndex !== -1) {
        // Update existing transposition
        songTranspositions[existingIndex] = {
          ...songTranspositions[existingIndex],
          transposition,
          useFlats
        };
      } else {
        // Add new transposition
        songTranspositions.push({
          songId,
          transposition,
          useFlats
        });
      }
      
      // Update the group in state
      const updatedGroups = groups.map(g => 
        g.id === groupId 
          ? { ...g, songTranspositions } 
          : g
      );
      
      setGroups(updatedGroups);
      
      toast({
        title: "Song transposition updated",
        description: `Song transposition has been updated successfully`,
      });

      return Promise.resolve();
    } catch (error) {
      toast({
        title: "Failed to update song transposition",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: GroupContextType = {
    groups,
    messages,
    loading,
    createGroup,
    getGroup,
    updateGroup,
    deleteGroup,
    addSongToGroup,
    removeSongFromGroup,
    addMemberToGroup,
    removeMemberFromGroup,
    sendMessage,
    getGroupMessages,
    getGroups,
    getOrganizationGroups,
    updateSongTransposition
  };

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
};

export default GroupContext;
