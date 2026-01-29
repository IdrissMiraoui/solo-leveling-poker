import { useState } from 'react';
import { Routes, Route, useNavigate, useParams, Navigate, useSearchParams } from 'react-router-dom';
import { Lobby } from './components/Lobby';
import { Arena } from './components/Arena';

function App() {
  const [user, setUser] = useState<{ name: string, avatar: string } | null>(null);
  const navigate = useNavigate();

  const handleJoin = (name: string, avatar: string, roomId: string) => {
    setUser({ name, avatar });
    navigate(`/room/${roomId}`);
  };

  const handleLeave = () => {
    setUser(null);
    navigate('/');
  };

  return (
    <div className="text-white">
      <Routes>
        <Route
          path="/"
          element={<LobbyWrapper onJoin={handleJoin} />}
        />
        <Route
          path="/room/:roomId"
          element={
            <ProtectedRoute user={user}>
              <ArenaWrapper onLeave={handleLeave} user={user} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

// Helper to handle extracting initial Room ID from URL query params for Lobby
const LobbyWrapper = ({ onJoin }: { onJoin: (n: string, a: string, r: string) => void }) => {
  const [searchParams] = useSearchParams();
  const initialRoomId = searchParams.get('room') || '';
  return <Lobby onJoin={onJoin} initialRoomId={initialRoomId} />;
};

// Helper to protect Arena route
const ProtectedRoute = ({ user, children }: { user: any, children: any }) => {
  const { roomId } = useParams();
  if (!user) {
    return <Navigate to={`/?room=${roomId}`} replace />;
  }
  return children;
};

// Helper to extract params for Arena
const ArenaWrapper = ({ onLeave, user }: { onLeave: () => void, user: any }) => {
  const { roomId } = useParams();

  // Should shouldn't happen due to ProtectedRoute, but TS safety
  if (!roomId || !user) return null;

  return (
    <Arena
      roomId={roomId}
      playerName={user.name}
      avatar={user.avatar}
      onLeave={onLeave}
    />
  );
}

export default App;
