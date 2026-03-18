'use client'

import { use } from 'react'
import Link from 'next/link'
import { MapPin, Phone, Clock, Users, ChevronRight, Loader2, Navigation, Tag } from 'lucide-react'
import { useGetProfile } from '@/modules/establishments'
import { useGeolocation } from '@/hooks/useGeolocation'
import { formatCurrency, formatDuration } from '@/lib/utils'

export default function EstablishmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const geo = useGeolocation()
  const coords = geo.status === 'success' ? { lat: geo.lat, lng: geo.lng } : undefined
  const { data: profile, isLoading, error } = useGetProfile(slug, coords)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 size={28} className="animate-spin text-indigo-400" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4 bg-slate-50">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Negocio no encontrado</h1>
          <p className="text-slate-500 text-sm">Verifica que la dirección sea correcta.</p>
        </div>
      </div>
    )
  }

  const primaryColor = profile.primaryColor ?? '#4f46e5'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div
        className="relative h-52 flex items-end"
        style={{ background: `linear-gradient(145deg, ${primaryColor}ee 0%, ${primaryColor} 100%)` }}
      >
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 right-12 w-24 h-24 rounded-full bg-white/5 translate-y-1/3" />

        <div className="relative w-full max-w-xl mx-auto px-5 pb-6 flex items-end gap-4">
          {profile.logoUrl ? (
            <img
              src={profile.logoUrl}
              alt={profile.name}
              className="w-16 h-16 rounded-2xl border-2 border-white/40 object-cover shadow-lg shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shadow-lg shrink-0">
              <span className="text-2xl font-bold text-white">{profile.name[0]}</span>
            </div>
          )}
          <div className="pb-0.5">
            <h1 className="text-xl font-bold text-white leading-tight">{profile.name}</h1>
            <p className="text-white/60 text-xs mt-0.5">{profile.timezone}</p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-5 space-y-6">
        {/* Geolocation banner */}
        {geo.status === 'denied' && (
          <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-xs text-amber-700">
            <Navigation size={14} className="shrink-0" />
            <span>Activa la ubicación para ver las sedes más cercanas primero.</span>
          </div>
        )}

        {/* Branches */}
        {profile.branches.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 px-1">Sedes</h2>
            <div className="space-y-2">
              {profile.branches.map(branch => (
                <div
                  key={branch.id}
                  className="bg-white rounded-2xl border border-gray-100 px-4 py-3.5 flex items-start gap-3 shadow-sm"
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin size={14} className="text-slate-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm text-gray-900">{branch.name}</p>
                      {branch.distanceKm != null && (
                        <span className="shrink-0 text-xs bg-indigo-50 text-indigo-600 font-semibold px-2 py-0.5 rounded-full">
                          {branch.distanceKm < 1
                            ? `${Math.round(branch.distanceKm * 1000)} m`
                            : `${branch.distanceKm.toFixed(1)} km`}
                        </span>
                      )}
                    </div>
                    {branch.address && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">{branch.address}</p>
                    )}
                    {branch.phone && (
                      <a
                        href={`tel:${branch.phone}`}
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 mt-1 hover:underline"
                      >
                        <Phone size={11} />
                        {branch.phone}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Services */}
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 px-1">Servicios</h2>
          <div className="space-y-2">
            {profile.services.map(service => (
              <Link
                key={service.id}
                href={`/${slug}/book?serviceId=${service.id}`}
                className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all duration-200 group"
              >
                <div className="px-4 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <Tag size={16} className="text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{service.name}</p>
                    {service.description && (
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{service.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock size={11} />
                        {formatDuration(service.durationMinutes)}
                      </span>
                      {service.maxCapacity > 1 && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Users size={11} />
                          Hasta {service.maxCapacity}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <p className="font-bold text-gray-900 text-sm">{formatCurrency(service.price, service.currency)}</p>
                    <ChevronRight size={15} className="text-gray-300 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Booking policy */}
        <section className="bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3.5 text-xs text-indigo-600 space-y-1">
          <p className="font-semibold text-indigo-700 mb-1.5">Política de reservas</p>
          <p>· Reserva con al menos {profile.minAdvanceBookingHours}h de anticipación</p>
          <p>· Cancelación gratuita hasta {profile.cancellationWindowHours}h antes</p>
        </section>
      </div>
    </div>
  )
}
