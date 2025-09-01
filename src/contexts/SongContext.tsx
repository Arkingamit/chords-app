import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect
} from 'react';
import { Song, SongInput, SongUpdateInput } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';

// Helper function: transform two-line chords into inline format
function transformChords(input: string): string {
  const lines = input.split(/\r?\n/).filter(l => l.trim().length > 0);
  const outputLines: string[] = [];

  let i = 0;
  while (i < lines.length) {
    const currentLine = lines[i].trim();

    const isChordLine = currentLine.replace(/\s+/g, '').length <=10;

    if (isChordLine && i + 1 < lines.length) {
      const chordLine = lines[i];
      const lyricLine = lines[i + 1];

      const chords: { pos: number; chord: string }[] = [];
      const chordRegex = /(\S+)/g;
      let match: RegExpExecArray | null;
      while ((match = chordRegex.exec(chordLine)) !== null) {
        chords.push({ pos: match.index, chord: match[1] });
      }

      const paddedLyrics = lyricLine.padEnd(chordLine.length, ' ');
      let result = '';
      let cursor = 0;
      for (const { pos, chord } of chords) {
        const segment = paddedLyrics.slice(cursor, pos);
        result += segment + `[${chord}]`;
        cursor = pos;
      }
      result += paddedLyrics.slice(cursor);
      outputLines.push(result.trimEnd());

      i += 2;
    } else {
      outputLines.push(currentLine); // just push lyric as-is
      i += 1;
    }
  }

  return outputLines.join('\n');
}

// Mock lyrics
const rawLivingHope = `
    D                A
How great the chasm that lay between us
    G        Bm            A
How high the mountain   I could not climb
        D                  A
In desperation I turned to heaven
    G      A      D
And spoke Your name into the night

    G           D
Then through the darkness
          Bm          A
Your loving kindness
    D              A
Tore through the shadows of my soul
    G             A
The work is finished,
`;

const hallelujah = 
`  C                 Am
I heard there was a secret chord
     C                   Am
That David played and it pleased the Lord
    F                G               C        G
But you don't really care for music, do you?
        C                  F           G
Well it goes like this the fourth, the fifth
    Am                 F
The minor fall and the major lift
    G            E7             Am
The baffled king composing hallelujah
 
     F           Am          F           C    G   C      Am C Am
Hallelujah, hallelujah, hallelujah, hallelu-u-u-u-jah ....       
Hallelujah, hallelujah, hallelujah, hallelu-u-u-u-jah ....       
That David played and it pleased the Lord
But you don't really care for music, do you?
Well it goes like this the fourth, the fifth
The minor fall and the major lift
The baffled king composing hallelujah
Hallelujah, hallelujah, hallelujah, hallelu-u-u-u-jah ....`;

// Mock songs
const mockSongs: Song[] = [
  {
    id: '1',
    title: 'Living Hope',
    artist: 'John Lennon',
    genre: 'Worship',
    lyrics: transformChords(rawLivingHope),
    createdBy: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Hallelujah',
    artist: 'Leonard Cohen',
    genre: 'Folk',
    lyrics: transformChords(hallelujah),
    createdBy: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Context type
interface SongContextType {
  songs: Song[];
  loading: boolean;
  addSong: (song: SongInput) => Promise<void>;
  getSong: (id: string) => Song | undefined;
  updateSong: (id: string, song: Partial<Song>) => Promise<void>;
  deleteSong: (id: string) => Promise<void>;
  getAllSongs: () => Song[]; // ✅
}

// Create Context
const SongContext = createContext<SongContextType | null>(null);

// Provider
export const SongProvider = ({ children }: { children: ReactNode }) => {
  const [songs, setSongs] = useState<Song[]>(mockSongs);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  useEffect(() => {
    setLoading(false); // Simulate loading
  }, []);

  const addSong = async (songInput: SongInput) => {
    setLoading(true);
    try {
      if (!currentUser) throw new Error('You must be logged in to add a song');
      if (currentUser.role === 'viewer') throw new Error('You do not have permission to add songs');

      const newSong: Song = {
        ...songInput,
        id: String(songs.length + 1),
        createdBy: currentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setSongs([...songs, newSong]);

      toast({
        title: 'Song added',
        description: `${newSong.title} has been added successfully`
      });
    } catch (error) {
      toast({
        title: 'Failed to add song',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getSong = (id: string) => songs.find(song => song.id === id);

  const updateSong = async (id: string, updatedSongData: Partial<Song>) => {
    setLoading(true);
    try {
      if (!currentUser) throw new Error('You must be logged in to update a song');

      const song = songs.find(s => s.id === id);
      if (!song) throw new Error('Song not found');

      if (
        currentUser.role === 'viewer' ||
        (currentUser.role === 'editor' && song.createdBy !== currentUser.id)
      ) {
        throw new Error('You do not have permission to update this song');
      }

      const updatedSongs = songs.map(s =>
        s.id === id ? { ...s, ...updatedSongData, updatedAt: new Date().toISOString() } : s
      );

      setSongs(updatedSongs);

      toast({
        title: 'Song updated',
        description: `${song.title} has been updated successfully`
      });
    } catch (error) {
      toast({
        title: 'Failed to update song',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteSong = async (id: string) => {
    setLoading(true);
    try {
      if (!currentUser) throw new Error('You must be logged in to delete a song');

      const song = songs.find(s => s.id === id);
      if (!song) throw new Error('Song not found');

      if (
        currentUser.role !== 'admin' &&
        (currentUser.role === 'editor' && song.createdBy !== currentUser.id)
      ) {
        throw new Error('You do not have permission to delete this song');
      }

      setSongs(songs.filter(s => s.id !== id));

      toast({
        title: 'Song deleted',
        description: `${song.title} has been deleted successfully`
      });
    } catch (error) {
      toast({
        title: 'Failed to delete song',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getAllSongs = () => songs;

  const value: SongContextType = {
    songs,
    loading,
    addSong,
    getSong,
    updateSong,
    deleteSong,
    getAllSongs
  };

  return <SongContext.Provider value={value}>{children}</SongContext.Provider>;
};

// Hook
export const useSongs = () => {
  const context = useContext(SongContext);
  if (!context) {
    throw new Error('useSongs must be used within a SongProvider');
  }
  return context;
};
