'use client'

import { use } from 'react'
import Link from 'next/link'
import { MapPin, Phone, Clock, Users, ChevronRight, Loader2 } from 'lucide-react'
import { useGetProfile } from '@/modules/establishments'
import { formatCurrency, formatDuration } from '@/lib/utils'

export default function EstablishmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { data: profile, isLoading, error } = useGetProfile(slug)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-indigo-400" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Negocio no encontrado</h1>
          <p className="text-gray-500">Verifica que la dirección sea correcta.</p>
        </div>
      </div>
    )
  }

  const primaryColor = profile.primaryColor ?? '#4f46e5'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div
        className="h-36 flex items-end px-6 pb-4"
        style={{ background: `linear-gradient(135deg, ${primaryColor}cc, ${primaryColor})` }}
      >
        <div className="flex items-center gap-4">
          {profile.logoUrl ? (
            <img
              src={profile.logoUrl}
              alt={profile.name}
              className="w-16 h-16 rounded-2xl border-2 border-white/30 object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{profile.name[0]}</span>
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-white">{profile.name}</h1>
            <p className="text-white/70 text-sm">{profile.timezone}</p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
        {/* Branches */}
        {profile.branches.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Sedes</h2>
            <div className="space-y-2">
              {profile.branches.map(branch => (
                <div key={branch.id} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-start gap-3">
                  <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-gray-900">{branch.name}</p>
                    {branch.address && <p className="text-xs text-gray-500 truncate">{branch.address}</p>}
                    {branch.phone && (
                      <a href={`tel:${branch.phone}`} className="text-xs text-indigo-600 flex items-center gap-1 mt-0.5">
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
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Servicios</h2>
          <div className="space-y-2">
            {profile.services.map(service => (
              <Link
                key={service.id}
                href={`/${slug}/book?serviceId=${service.id}`}
                className="bg-white rounded-xl border border-gray-100 px-4 py-4 flex items-center gap-4 hover:border-indigo-200 hover:shadow-sm transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{service.name}</p>
                  {service.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{service.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock size={12} />
                      {formatDuration(service.durationMinutes)}
                    </span>
                    {service.maxCapacity > 1 && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Users size={12} />
                        Hasta {service.maxCapacity} personas
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-900 text-sm">{formatCurrency(service.price, service.currency)}</p>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-indigo-400 ml-auto mt-1 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Booking rules info */}
        <section className="bg-indigo-50 rounded-xl px-4 py-3 text-xs text-indigo-700 space-y-1">
          <p>· Reserva con al menos {profile.minAdvanceBookingHours}h de anticipación</p>
          <p>· Cancelación gratuita hasta {profile.cancellationWindowHours}h antes de tu cita</p>
        </section>
      </div>
    </div>
  )
}
