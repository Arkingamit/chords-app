import { Group, GroupInput, GroupUpdateInput, Message, MessageInput } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/lib/types';

// Actions for group operations
export const createGroupActions = (
  groups: Group[],
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>,
  currentUser: User | null,
  toast: ReturnType<typeof useToast>["toast"],
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const createGroup = async (groupInput: GroupInput): Promise<string> => {
    setLoading(true);
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to create a group');
      }

      // Simulate API call
      const newGroup: Group = {
        ...groupInput,
        id: String(groups.length + 1),
        createdBy: currentUser.id,
        createdAt: new Date().toISOString(),
        songs: [],
        members: groupInput.members || [] // Ensure members is always initialized
      };

      setGroups([...groups, newGroup]);
      
      toast({
        title: "Group created",
        description: `${newGroup.name} has been created successfully`,
      });

      return newGroup.id;
    } catch (error) {
      toast({
        title: "Failed to create group",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getGroup = (id: string) => {
    return groups.find(group => group.id === id);
  };

  const updateGroup = async (id: string, updatedGroupData: GroupUpdateInput) => {
    setLoading(true);
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to update a group');
      }

      const group = groups.find(g => g.id === id);
      if (!group) {
        throw new Error('Group not found');
      }

      if (currentUser.role !== 'admin' && group.createdBy !== currentUser.id) {
        throw new Error('You do not have permission to update this group');
      }

      // Update the group
      const updatedGroups = groups.map(g => 
        g.id === id ? { ...g, ...updatedGroupData } : g
      );
      
      setGroups(updatedGroups);
      
      toast({
        title: "Group updated",
        description: `${group.name} has been updated successfully`,
      });

      return Promise.resolve();
    } catch (error) {
      toast({
        title: "Failed to update group",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async (id: string) => {
    setLoading(true);
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to delete a group');
      }

      const group = groups.find(g => g.id === id);
      if (!group) {
        throw new Error('Group not found');
      }

      if (currentUser.role !== 'admin' && group.createdBy !== currentUser.id) {
        throw new Error('You do not have permission to delete this group');
      }

      // Delete the group
      setGroups(groups.filter(g => g.id !== id));
      
      toast({
        title: "Group deleted",
        description: `${group.name} has been deleted successfully`,
      });

      return Promise.resolve();
    } catch (error) {
      toast({
        title: "Failed to delete group",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createGroup,
    getGroup,
    updateGroup,
    deleteGroup,
  };
};

export const createSongActions = (
  groups: Group[],
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>,
  currentUser: User | null,
  toast: ReturnType<typeof useToast>["toast"],
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const addSongToGroup = async (groupId: string, songId: string) => {
    setLoading(true);
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to add a song to a group');
      }

      const group = groups.find(g => g.id === groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      if (!group.members.includes(currentUser.id)) {
        throw new Error('You must be a member of the group to add songs');
      }

      if (group.songs.includes(songId)) {
        throw new Error('This song is already in the group');
      }

      // Add the song to the group
      const updatedGroups = groups.map(g => 
        g.id === groupId 
          ? { ...g, songs: [...g.songs, songId] } 
          : g
      );
      
      setGroups(updatedGroups);
      
      toast({
        title: "Song added to group",
        description: `Song has been added to ${group.name} successfully`,
      });

      return Promise.resolve();
    } catch (error) {
      toast({
        title: "Failed to add song to group",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeSongFromGroup = async (groupId: string, songId: string) => {
    setLoading(true);
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to remove a song from a group');
      }

      const group = groups.find(g => g.id === groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      if (currentUser.role !== 'admin' && group.createdBy !== currentUser.id && !group.members.includes(currentUser.id)) {
        throw new Error('You do not have permission to remove songs from this group');
      }

      // Remove the song from the group
      const updatedGroups = groups.map(g => 
        g.id === groupId 
          ? { ...g, songs: g.songs.filter(s => s !== songId) } 
          : g
      );
      
      setGroups(updatedGroups);
      
      toast({
        title: "Song removed from group",
        description: `Song has been removed from ${group.name} successfully`,
      });

      return Promise.resolve();
    } catch (error) {
      toast({
        title: "Failed to remove song from group",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    addSongToGroup,
    removeSongFromGroup
  };
};

export const createMemberActions = (
  groups: Group[],
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>,
  currentUser: User | null,
  toast: ReturnType<typeof useToast>["toast"],
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const addMemberToGroup = async (groupId: string, userId: string) => {
    setLoading(true);
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to add a member to a group');
      }

      const group = groups.find(g => g.id === groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      if (currentUser.role !== 'admin' && group.createdBy !== currentUser.id) {
        throw new Error('You do not have permission to add members to this group');
      }

      if (group.members.includes(userId)) {
        throw new Error('This user is already a member of the group');
      }

      // Add the member to the group
      const updatedGroups = groups.map(g => 
        g.id === groupId 
          ? { ...g, members: [...g.members, userId] } 
          : g
      );
      
      setGroups(updatedGroups);
      
      toast({
        title: "Member added to group",
        description: `User has been added to ${group.name} successfully`,
      });

      return Promise.resolve();
    } catch (error) {
      toast({
        title: "Failed to add member to group",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeMemberFromGroup = async (groupId: string, userId: string) => {
    setLoading(true);
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to remove a member from a group');
      }

      const group = groups.find(g => g.id === groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      if (currentUser.role !== 'admin' && group.createdBy !== currentUser.id) {
        throw new Error('You do not have permission to remove members from this group');
      }

      if (group.createdBy === userId) {
        throw new Error('Cannot remove the group creator');
      }

      // Remove the member from the group
      const updatedGroups = groups.map(g => 
        g.id === groupId 
          ? { ...g, members: g.members.filter(m => m !== userId) } 
          : g
      );
      
      setGroups(updatedGroups);
      
      toast({
        title: "Member removed from group",
        description: `User has been removed from ${group.name} successfully`,
      });

      return Promise.resolve();
    } catch (error) {
      toast({
        title: "Failed to remove member from group",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    addMemberToGroup,
    removeMemberFromGroup
  };
};

export const createMessageActions = (
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  groups: Group[],
  currentUser: User | null,
  toast: ReturnType<typeof useToast>["toast"]
) => {
  const sendMessage = async (messageInput: MessageInput) => {
    try {
      if (!currentUser) {
        throw new Error('You must be logged in to send a message');
      }

      const group = groups.find(g => g.id === messageInput.groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      if (!group.members.includes(currentUser.id)) {
        throw new Error('You must be a member of the group to send messages');
      }

      // Create and add the message
      const newMessage: Message = {
        id: String(messages.length + 1),
        content: messageInput.content,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString(),
        groupId: messageInput.groupId
      };

      setMessages([...messages, newMessage]);

      return Promise.resolve();
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getGroupMessages = (groupId: string) => {
    return messages.filter(message => message.groupId === groupId);
  };

  return {
    sendMessage,
    getGroupMessages
  };
};

export const createQueryActions = (groups: Group[]) => {
  const getOrganizationGroups = (organizationId: string) => {
    return groups.filter(group => group.organizationId === organizationId);
  };

  return {
    getOrganizationGroups
  };
};