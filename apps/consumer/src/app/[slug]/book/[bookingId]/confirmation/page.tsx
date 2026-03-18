'use client'

import { use } from 'react'
import Link from 'next/link'
import { CheckCircle, CalendarDays, ArrowLeft } from 'lucide-react'

export default function ConfirmationPage({
  params,
}: {
  params: Promise<{ slug: string; bookingId: string }>
}) {
  const { slug, bookingId } = use(params)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-5">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={32} className="text-green-600" />
            </div>
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-900">¡Reserva confirmada!</h1>
            <p className="text-sm text-gray-500 mt-2">
              Tu reserva ha sido creada exitosamente. Recibirás una confirmación por email.
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-500 text-left">
            <p>ID de reserva:</p>
            <p className="font-mono text-gray-700 break-all mt-0.5">{bookingId}</p>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/mis-reservas"
            className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl text-sm transition-colors"
          >
            <CalendarDays size={16} />
            Ver mis reservas
          </Link>
          <Link
            href={`/${slug}`}
            className="flex items-center justify-center gap-2 w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            Volver al negocio
          </Link>
        </div>
      </div>
    </div>
  )
}
