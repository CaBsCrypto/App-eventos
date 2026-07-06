import { Calendar, MapPin, Users, Award } from 'lucide-react';
import { Event } from '../types';

interface EventCardProps {
  key?: any;
  event: Event;
  onSelect: (event: Event) => void;
  isRegistered: boolean;
}

export default function EventCard({ event, onSelect, isRegistered }: EventCardProps) {
  // Beautiful category tags colors
  const categoryStyles = {
    'Hacker House': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    'Workshop': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    'Meetup': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Conference': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  };

  return (
    <div 
      onClick={() => onSelect(event)}
      className="group relative flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-750 transition-all duration-300 cursor-pointer hover:-translate-y-1 shadow-md"
    >
      {/* Event banner image */}
      <div className="relative h-44 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/30 z-10" />
        <img 
          src={event.image} 
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        
        {/* Category tag */}
        <span className={`absolute top-4 left-4 z-20 px-3 py-1 border rounded-full text-xs font-semibold ${categoryStyles[event.category]}`}>
          {event.category}
        </span>

        {/* Registered status */}
        {isRegistered && (
          <span className="absolute top-4 right-4 z-20 bg-emerald-500 text-white text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1">
            <Award className="w-3.5 h-3.5" /> Registrado
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
            {event.title}
          </h3>
          <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Location & Time info */}
        <div className="mt-4 pt-4 border-t border-zinc-850 space-y-2 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-zinc-500 shrink-0" />
            <span>{event.date} • {event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-zinc-500 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-zinc-500 shrink-0" />
              <span>{event.actualAttendance || 0} de {event.expectedAttendance} asistentes</span>
            </div>
            
            {/* Sponsor mini badges inside card */}
            {event.sponsors && event.sponsors.length > 0 && (
              <div className="flex -space-x-1.5 items-center">
                {event.sponsors.slice(0, 3).map((sp) => (
                  <span 
                    key={sp.id} 
                    className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-950 flex items-center justify-center text-[10px]" 
                    title={`Patrocinador: ${sp.name}`}
                  >
                    {sp.logo}
                  </span>
                ))}
                {event.sponsors.length > 3 && (
                  <span className="text-[9px] text-zinc-500 font-bold pl-1">+{event.sponsors.length - 3}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
