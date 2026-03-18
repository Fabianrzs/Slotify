'use client'

import { use } from 'react'
import Link from 'next/link'
import { CalendarDays, ArrowLeft, Check } from 'lucide-react'

export default function ConfirmationPage({
  params,
}: {
  params: Promise<{ slug: string; bookingId: string }>
}) {
  const { slug, bookingId } = use(params)

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-100 rounded-full opacity-30 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-100 rounded-full opacity-40 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm space-y-4">
        {/* Success card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 text-center space-y-5">
          {/* Animated check */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
                <Check size={36} strokeWidth={3} className="text-white" />
              </div>
              <div className="absolute inset-0 bg-emerald-400 rounded-full opacity-20 scale-125 animate-ping" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">¡Reserva confirmada!</h1>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              Tu cita ha sido agendada exitosamente. Recibirás un correo de confirmación.
            </p>
          </div>

          {/* Booking ID */}
          <div className="bg-slate-50 rounded-2xl px-4 py-3 text-left">
            <p className="text-xs text-slate-400 mb-1">Número de reserva</p>
            <p className="font-mono text-xs text-gray-700 break-all leading-relaxed">{bookingId}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          <Link
            href="/mis-reservas"
            className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-2xl text-sm transition-all shadow-sm shadow-indigo-200"
          >
            <CalendarDays size={16} />
            Ver mis reservas
          </Link>
          <Link
            href={`/${slug}`}
            className="flex items-center justify-center gap-2 w-full bg-white border border-gray-200 hover:bg-slate-50 text-gray-700 font-medium py-3.5 rounded-2xl text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            Volver al negocio
          </Link>
        </div>
      </div>
    </div>
  )
}
