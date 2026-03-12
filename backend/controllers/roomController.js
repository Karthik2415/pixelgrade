const { getDb } = require("../config/firebase");

// Generate a random 6-character alphanumeric code
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * POST /rooms
 * Trainer creates a new classroom
 */
exports.createRoom = async (req, res) => {
  try {
    const { name, description } = req.body;
    const trainerId = req.user.userId;

    if (!name) {
      return res.status(400).json({ success: false, message: "Room name is required" });
    }

    const db = getDb();
    
    // Ensure room code uniqueness (in rare case of collision, regenerate)
    let roomCode = generateRoomCode();
    let isUnique = false;
    while (!isUnique) {
      const existing = await db.collection("rooms").where("roomCode", "==", roomCode).get();
      if (existing.empty) {
        isUnique = true;
      } else {
        roomCode = generateRoomCode();
      }
    }

    const newRoom = {
      name,
      description: description || "",
      roomCode,
      trainerId,
      students: [],
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection("rooms").add(newRoom);

    res.status(201).json({
      success: true,
      data: { roomId: docRef.id, ...newRoom }
    });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ success: false, message: "Failed to create room", error: error.message });
  }
};

/**
 * POST /rooms/join
 * Student joins a room using a 6-character code
 */
exports.joinRoom = async (req, res) => {
  try {
    let { roomCode } = req.body;
    const studentId = req.user.userId;

    if (!roomCode) {
      return res.status(400).json({ success: false, message: "Room code is required" });
    }

    roomCode = roomCode.toUpperCase().trim();
    const db = getDb();
    
    const roomsSnapshot = await db.collection("rooms").where("roomCode", "==", roomCode).get();
    
    if (roomsSnapshot.empty) {
      return res.status(404).json({ success: false, message: "Invalid room code" });
    }

    const roomDoc = roomsSnapshot.docs[0];
    const roomData = roomDoc.data();

    // Check if student is already in the room
    if (roomData.students && roomData.students.includes(studentId)) {
      return res.status(400).json({ success: false, message: "You are already in this room" });
    }

    // Add student to array
    const updatedStudents = [...(roomData.students || []), studentId];
    await roomDoc.ref.update({ students: updatedStudents });

    res.json({
      success: true,
      message: "Successfully joined room",
      data: { roomId: roomDoc.id, name: roomData.name, roomCode: roomData.roomCode }
    });
  } catch (error) {
    console.error("Error joining room:", error);
    res.status(500).json({ success: false, message: "Failed to join room", error: error.message });
  }
};

/**
 * GET /rooms
 * Depending on role, fetch Trainer's created rooms, or Student's joined rooms.
 */
exports.getRooms = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const db = getDb();
    let roomsSnapshot;

    if (role === "trainer") {
      roomsSnapshot = await db.collection("rooms").where("trainerId", "==", userId).get();
    } else {
      roomsSnapshot = await db.collection("rooms").where("students", "array-contains", userId).get();
    }

    const rooms = [];
    roomsSnapshot.forEach(doc => {
      rooms.push({ roomId: doc.id, ...doc.data() });
    });

    // Sort by newest first
    rooms.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, data: rooms });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ success: false, message: "Failed to fetch rooms", error: error.message });
  }
};

/**
 * GET /rooms/:id
 * Get details for a specific room
 */
exports.getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    
    const doc = await db.collection("rooms").doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    res.json({ success: true, data: { roomId: doc.id, ...doc.data() } });
  } catch (error) {
    console.error("Error fetching room details:", error);
    res.status(500).json({ success: false, message: "Failed to fetch room", error: error.message });
  }
};
