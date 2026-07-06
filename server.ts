import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;

// Persistent database path in workspace
const DB_FILE = path.join(process.cwd(), 'db-store.json');

// Types for DB
import { Event, Attendee, Sponsor, Feedback, NotificationItem } from './src/types';
import { INITIAL_EVENTS, SAMPLE_LEADERBOARD_ATTENDEES, INITIAL_SPONSORS, INITIAL_BADGES } from './src/data';

interface DatabaseSchema {
  events: Event[];
  attendees: Attendee[];
  sponsors: Sponsor[];
  notifications: NotificationItem[];
}

// Helper to initialize/load database
function loadDatabase(): DatabaseSchema {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading db file, resetting', e);
    }
  }
  
  // Seed database
  const defaultDb: DatabaseSchema = {
    events: INITIAL_EVENTS,
    attendees: SAMPLE_LEADERBOARD_ATTENDEES,
    sponsors: INITIAL_SPONSORS,
    notifications: [
      {
        id: 'notif_1',
        title: '¡Te damos la bienvenida!',
        message: 'Conéctate mediante Privy para recibir tu primera insignia de Onboarding.',
        timestamp: new Date().toISOString(),
        read: false
      }
    ]
  };
  saveDatabase(defaultDb);
  return defaultDb;
}

function saveDatabase(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving db file', e);
  }
}

// Load database immediately
let db = loadDatabase();

async function startServer() {
  const app = express();
  app.use(express.json());

  // --- API ROUTES ---

  // 1. Get all events
  app.get('/api/events', (req, res) => {
    db = loadDatabase();
    res.json(db.events);
  });

  // 2. Create high-quality custom event
  app.post('/api/events', (req, res) => {
    db = loadDatabase();
    const { 
      title, 
      description, 
      date, 
      time, 
      location, 
      category, 
      expectedAttendance, 
      image, 
      sponsors, 
      activities,
      startDate,
      startTime,
      endDate,
      endTime,
      ticketPrice,
      timezone
    } = req.body;
    
    if (!title || !date || !location || !category) {
      res.status(400).json({ error: 'Missing required event fields' });
      return;
    }

    const newEvent: Event = {
      id: `evt_${Date.now()}`,
      title,
      description: description || '',
      date,
      time: time || '12:00 PM',
      location,
      category,
      expectedAttendance: Number(expectedAttendance) || 100,
      actualAttendance: 0,
      image: image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      sponsors: sponsors || [],
      activities: activities || [],
      startDate: startDate || undefined,
      startTime: startTime || undefined,
      endDate: endDate || undefined,
      endTime: endTime || undefined,
      ticketPrice: ticketPrice || 'Gratis',
      timezone: timezone || undefined
    };

    db.events.push(newEvent);
    
    // Send in-app notification
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      title: '¡Nuevo evento creado!',
      message: `Se ha publicado el evento: "${title}". Ya puedes registrarte.`,
      timestamp: new Date().toISOString(),
      read: false
    });

    saveDatabase(db);
    res.status(201).json(newEvent);
  });

  // 3. Register or connect attendee via Privy
  app.post('/api/attendees/onboard', (req, res) => {
    db = loadDatabase();
    const { name, email, walletAddress, walletType } = req.body;

    if (!name || !email || !walletAddress) {
      res.status(400).json({ error: 'Name, email and walletAddress are required' });
      return;
    }

    // Check if attendee already exists
    let attendee = db.attendees.find(a => a.email.toLowerCase() === email.toLowerCase() || a.walletAddress.toLowerCase() === walletAddress.toLowerCase());

    if (!attendee) {
      // Generate Genesis Pioneer Badge for onboarding completed
      const welcomeBadge = {
        id: INITIAL_BADGES[0].id,
        title: INITIAL_BADGES[0].title,
        description: INITIAL_BADGES[0].description,
        image: INITIAL_BADGES[0].image,
        unlockedAt: new Date().toISOString(),
        nftId: `BADGE-NFT-${Math.floor(100000 + Math.random() * 900000)}`,
        dynamicMetadata: {
          level: 1,
          activitiesCompleted: 1,
          completionTime: new Date().toISOString(),
          txHash: `0x${Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')}`
        }
      };

      attendee = {
        id: `at_${Date.now()}`,
        name,
        email,
        walletAddress,
        walletType: walletType || 'Privy',
        joinedAt: new Date().toISOString().split('T')[0],
        points: 100, // Genesis bonus
        completedActivities: [], // To be checked in
        badges: [welcomeBadge],
        checkedIn: false,
        calendarSynced: false,
        registeredEvents: [],
        registeredActivities: []
      };

      db.attendees.push(attendee);
      
      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        title: '🚀 Onboarding Completado',
        message: `¡Bienvenido ${name}! Has recibido tu primera insignia NFT: Genesis Pioneer.`,
        timestamp: new Date().toISOString(),
        read: false
      });

      saveDatabase(db);
    }

    res.json(attendee);
  });

  // 4.6 Register attendee to an activity
  app.post('/api/attendees/:id/register-activity', (req, res) => {
    db = loadDatabase();
    const attendeeId = req.params.id;
    const { activityId } = req.body;

    const attendee = db.attendees.find(a => a.id === attendeeId);
    if (!attendee) {
      res.status(404).json({ error: 'Attendee not found' });
      return;
    }

    if (!attendee.registeredActivities) {
      attendee.registeredActivities = [];
    }

    if (!attendee.registeredActivities.includes(activityId)) {
      attendee.registeredActivities.push(activityId);

      // Find activity title
      let activityTitle = 'Actividad';
      for (const e of db.events) {
        const act = e.activities.find(a => a.id === activityId);
        if (act) {
          activityTitle = act.title;
          break;
        }
      }

      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        title: '✍️ Inscrito en Actividad',
        message: `Te has inscrito exitosamente en la actividad "${activityTitle}".`,
        timestamp: new Date().toISOString(),
        read: false
      });

      saveDatabase(db);
    }

    res.json(attendee);
  });

  // 4. Update attendee (points, checking in, sync status, etc)
  app.get('/api/attendees', (req, res) => {
    db = loadDatabase();
    res.json(db.attendees);
  });

  // 4.5 Register attendee to an event
  app.post('/api/attendees/:id/register-event', (req, res) => {
    db = loadDatabase();
    const attendeeId = req.params.id;
    const { eventId } = req.body;

    const attendee = db.attendees.find(a => a.id === attendeeId);
    if (!attendee) {
      res.status(404).json({ error: 'Attendee not found' });
      return;
    }

    if (!attendee.registeredEvents) {
      attendee.registeredEvents = [];
    }

    if (!attendee.registeredEvents.includes(eventId)) {
      attendee.registeredEvents.push(eventId);
      
      const event = db.events.find(e => e.id === eventId);
      if (event) {
        event.actualAttendance = (event.actualAttendance || 0) + 1;
      }

      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        title: '🎟️ Registro Completado',
        message: `Te has registrado correctamente en "${event?.title || 'Evento'}". ¡Prepárate para participar!`,
        timestamp: new Date().toISOString(),
        read: false
      });

      saveDatabase(db);
    }

    res.json(attendee);
  });

  // 4.7 Unregister attendee from an event
  app.post('/api/attendees/:id/unregister-event', (req, res) => {
    db = loadDatabase();
    const attendeeId = req.params.id;
    const { eventId } = req.body;

    const attendee = db.attendees.find(a => a.id === attendeeId);
    if (!attendee) {
      res.status(404).json({ error: 'Attendee not found' });
      return;
    }

    if (attendee.registeredEvents && attendee.registeredEvents.includes(eventId)) {
      attendee.registeredEvents = attendee.registeredEvents.filter(id => id !== eventId);

      const event = db.events.find(e => e.id === eventId);
      if (event) {
        if (event.actualAttendance && event.actualAttendance > 0) {
          event.actualAttendance -= 1;
        }

        // Clean registered and completed activities belonging to this event
        const activityIds = event.activities.map(a => a.id);
        if (attendee.registeredActivities) {
          attendee.registeredActivities = attendee.registeredActivities.filter(id => !activityIds.includes(id));
        }
        if (attendee.completedActivities) {
          attendee.completedActivities = attendee.completedActivities.filter(id => !activityIds.includes(id));
        }
      }

      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        title: '🎟️ Registro Cancelado',
        message: `Has cancelado tu inscripción al evento "${event?.title || 'Evento'}".`,
        timestamp: new Date().toISOString(),
        read: false
      });

      saveDatabase(db);
    }

    res.json(attendee);
  });

  // 5. Complete an event activity and dynamically mint/update NFT metadata
  app.post('/api/attendees/:id/activities/complete', (req, res) => {
    db = loadDatabase();
    const attendeeId = req.params.id;
    const { activityId, eventId } = req.body;

    const attendee = db.attendees.find(a => a.id === attendeeId);
    const event = db.events.find(e => e.id === eventId);
    
    if (!attendee) {
      res.status(404).json({ error: 'Attendee not found' });
      return;
    }
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const activity = event.activities.find(act => act.id === activityId);
    if (!activity) {
      res.status(404).json({ error: 'Activity not found' });
      return;
    }

    // Prevent double completion
    if (attendee.completedActivities.includes(activityId)) {
      res.json(attendee);
      return;
    }

    attendee.completedActivities.push(activityId);
    attendee.points += activity.points;

    // If this is a Check-In activity, toggle attendee check-in status
    if (activity.type === 'CheckIn') {
      attendee.checkedIn = true;
      event.actualAttendance = (event.actualAttendance || 0) + 1;
    }

    // Update POAP dynamic NFT metadata
    let pioneerBadge = attendee.badges.find(b => b.id === 'bd1');
    if (pioneerBadge && pioneerBadge.dynamicMetadata) {
      pioneerBadge.dynamicMetadata.activitiesCompleted = attendee.completedActivities.length;
      pioneerBadge.dynamicMetadata.level = Math.floor(attendee.completedActivities.length / 2) + 1;
      pioneerBadge.dynamicMetadata.completionTime = new Date().toISOString();
    }

    // Logic to unlock additional badges
    // 1. Visit Sponsor Badge (Code bd3)
    if (activity.type === 'SponsorVisit' && !attendee.badges.some(b => b.id === 'bd3')) {
      const sponsorBadge = {
        id: INITIAL_BADGES[2].id,
        title: INITIAL_BADGES[2].title,
        description: INITIAL_BADGES[2].description,
        image: INITIAL_BADGES[2].image,
        unlockedAt: new Date().toISOString(),
        nftId: `POAP-NF-${Math.floor(100000 + Math.random() * 900000)}`,
        dynamicMetadata: {
          level: 1,
          activitiesCompleted: attendee.completedActivities.length,
          completionTime: new Date().toISOString(),
          txHash: `0x${Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')}`
        }
      };
      attendee.badges.push(sponsorBadge);
    }

    // 2. Code Alchemist Badge (Code bd2)
    if (activity.type === 'Hackathon' && !attendee.badges.some(b => b.id === 'bd2')) {
      const codeBadge = {
        id: INITIAL_BADGES[1].id,
        title: INITIAL_BADGES[1].title,
        description: INITIAL_BADGES[1].description,
        image: INITIAL_BADGES[1].image,
        unlockedAt: new Date().toISOString(),
        nftId: `BADGE-NFT-${Math.floor(100000 + Math.random() * 900000)}`,
        dynamicMetadata: {
          level: 1,
          activitiesCompleted: attendee.completedActivities.length,
          completionTime: new Date().toISOString(),
          txHash: `0x${Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')}`
        }
      };
      attendee.badges.push(codeBadge);
    }

    // Trigger real-time alert simulator
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      title: '🎯 Actividad Completada',
      message: `${attendee.name} completó "${activity.title}" y obtuvo ${activity.points} puntos.`,
      timestamp: new Date().toISOString(),
      read: false
    });

    saveDatabase(db);
    res.json(attendee);
  });

  // 5.5 Delete an activity from an event
  app.delete('/api/events/:eventId/activities/:activityId', (req, res) => {
    db = loadDatabase();
    const { eventId, activityId } = req.params;
    const event = db.events.find(e => e.id === eventId);
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    
    event.activities = event.activities.filter(a => a.id !== activityId);
    
    // Clean completed or registered references in attendees
    db.attendees.forEach(a => {
      if (a.completedActivities) {
        a.completedActivities = a.completedActivities.filter(id => id !== activityId);
      }
      if (a.registeredActivities) {
        a.registeredActivities = a.registeredActivities.filter(id => id !== activityId);
      }
    });

    saveDatabase(db);
    res.json(event);
  });

  // 6. Submit Activity Feedback & Rating
  app.post('/api/events/:id/activities/:actId/feedback', (req, res) => {
    db = loadDatabase();
    const { id: eventId, actId: activityId } = req.params;
    const { rating, comment, attendeeName, attendeeId } = req.body;

    if (!rating || !attendeeName) {
      res.status(400).json({ error: 'Rating and attendeeName are required' });
      return;
    }

    const event = db.events.find(e => e.id === eventId);
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    // Initialize/find feedbacks array or attach directly
    if (!event.activities) {
      event.activities = [];
    }

    const feedback: Feedback = {
      id: `fb_${Date.now()}`,
      attendeeName,
      rating: Number(rating),
      comment: comment || '',
      timestamp: new Date().toISOString()
    };

    // Find dynamic feedbacks under that event or keep in activities feedback
    const activity = event.activities.find(a => a.id === activityId);
    if (!activity) {
      res.status(404).json({ error: 'Activity not found' });
      return;
    }

    // Save feedback
    const dbFeedback = (activity as any).feedbacks || [];
    dbFeedback.push(feedback);
    (activity as any).feedbacks = dbFeedback;

    // Reward attendee points for submitting feedback
    if (attendeeId) {
      const attendee = db.attendees.find(a => a.id === attendeeId);
      if (attendee) {
        attendee.points += 50; // Feedback reward
        // Feedbacks badge unlock check (bd4)
        if (!attendee.badges.some(b => b.id === 'bd4')) {
          attendee.badges.push({
            id: INITIAL_BADGES[3].id,
            title: INITIAL_BADGES[3].title,
            description: INITIAL_BADGES[3].description,
            image: INITIAL_BADGES[3].image,
            unlockedAt: new Date().toISOString(),
            nftId: `BADGE-NFT-${Math.floor(100000 + Math.random() * 900000)}`,
            dynamicMetadata: {
              level: 1,
              activitiesCompleted: attendee.completedActivities.length,
              completionTime: new Date().toISOString(),
              txHash: `0x${Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')}`
            }
          });
        }
      }
    }

    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      title: '💬 Nueva Valoración',
      message: `${attendeeName} calificó la actividad "${activity.title}" con ${'★'.repeat(rating)}.`,
      timestamp: new Date().toISOString(),
      read: false
    });

    saveDatabase(db);
    res.status(201).json(feedback);
  });

  // 7. Track Sponsor clicks & impressions
  app.post('/api/sponsors/:id/click', (req, res) => {
    db = loadDatabase();
    const sponsor = db.sponsors.find(s => s.id === req.params.id);
    if (sponsor) {
      sponsor.clicks += 1;
      saveDatabase(db);
      res.json({ success: true, clicks: sponsor.clicks });
    } else {
      res.status(404).json({ error: 'Sponsor not found' });
    }
  });

  // 8. Sync with Google Calendar, Gmail, and Google Sheets
  app.post('/api/google/sync-calendar', (req, res) => {
    const { attendeeId, eventId } = req.body;
    db = loadDatabase();

    const attendee = db.attendees.find(a => a.id === attendeeId);
    const event = db.events.find(e => e.id === eventId);

    if (!attendee || !event) {
      res.status(404).json({ error: 'Attendee or Event not found' });
      return;
    }

    attendee.calendarSynced = true;

    // Add notification
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      title: '📅 Google Calendar Sincronizado',
      message: `El evento "${event.title}" ha sido enlazado a tu Google Calendar. ¡Te enviaremos avisos automáticos!`,
      timestamp: new Date().toISOString(),
      read: false
    });

    saveDatabase(db);

    const startStr = (event.startDate && event.startTime) 
      ? `${event.startDate.replace(/-/g, '')}T${event.startTime.replace(/:/g, '')}00` 
      : '20260715T120000Z';
    const endStr = (event.endDate && event.endTime) 
      ? `${event.endDate.replace(/-/g, '')}T${event.endTime.replace(/:/g, '')}00` 
      : '20260715T230000Z';

    res.json({
      success: true,
      calendarLink: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startStr}/${endStr}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`
    });
  });

  app.post('/api/google/sheets-sync', (req, res) => {
    db = loadDatabase();
    res.json({
      success: true,
      message: 'Base de datos de asistentes sincronizada con Google Sheets exitosamente.',
      sheetUrl: 'https://docs.google.com/spreadsheets/d/1demo-sheets-tech-events-onboarding-2026/edit',
      syncedCount: db.attendees.length,
      timestamp: new Date().toISOString()
    });
  });

  app.post('/api/google/gmail-invite', (req, res) => {
    const { attendeeId, eventId } = req.body;
    db = loadDatabase();

    const attendee = db.attendees.find(a => a.id === attendeeId);
    const event = db.events.find(e => e.id === eventId);

    if (!attendee || !event) {
      res.status(404).json({ error: 'Attendee or Event not found' });
      return;
    }

    res.json({
      success: true,
      message: `Invitación del evento enviada con éxito a ${attendee.email} desde la cuenta del organizador.`,
      gmailLink: `https://mail.google.com/mail/?view=cm&fs=1&to=${attendee.email}&su=${encodeURIComponent('Tu Invitación a ' + event.title)}&body=${encodeURIComponent(`Hola ${attendee.name},\n\n¡Estás invitado/a a participar en ${event.title}!\n\nFecha: ${event.date}\nLugar: ${event.location}\n\nTus accesos y billetera ya están listos. Escanea tu credencial digital para sumar puntos.\n\nSaludos,\nOrganización del Evento`)}`
    });
  });

  // 9. Notifications
  app.get('/api/notifications', (req, res) => {
    db = loadDatabase();
    res.json(db.notifications);
  });

  app.post('/api/notifications/clear', (req, res) => {
    db = loadDatabase();
    db.notifications.forEach(n => n.read = true);
    saveDatabase(db);
    res.json({ success: true });
  });

  // 10. Data exports (CSV)
  app.get('/api/export/csv', (req, res) => {
    db = loadDatabase();
    let csv = 'ID,Nombre,Email,Billetera,Tipo Billetera,Puntos,Actividades Completadas,Insignias Obtenidas,Registrado el\n';
    db.attendees.forEach(a => {
      const badgesStr = a.badges.map(b => b.title).join(' | ');
      csv += `"${a.id}","${a.name}","${a.email}","${a.walletAddress}","${a.walletType}",${a.points},"${a.completedActivities.join(';')}","${badgesStr}","${a.joinedAt}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=attendees_report.csv');
    res.send(csv);
  });

  // Vite & Static file handler
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
