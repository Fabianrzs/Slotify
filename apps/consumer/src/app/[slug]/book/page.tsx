'use client'

import { use, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, CheckCircle, Loader2 } from 'lucide-react'
import { useGetProfile } from '@/modules/establishments'
import { useGetAvailableDates, useGetAvailableSlots } from '@/modules/availability'
import { useCreateBooking } from '@/modules/bookings'
import { useGeolocation } from '@/hooks/useGeolocation'
import { DatePicker } from '@/components/DatePicker'
import { SlotPicker } from '@/components/SlotPicker'
import { formatCurrency, formatDuration, formatDate, formatTime } from '@/lib/utils'

type Step = 'branch' | 'date' | 'slot' | 'confirm'

export default function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedServiceId = searchParams.get('serviceId') ?? ''
  const geo = useGeolocation()
  const coords = geo.status === 'success' ? { lat: geo.lat, lng: geo.lng } : undefined

  const { data: profile, isLoading: profileLoading } = useGetProfile(slug, coords)

  const [step, setStep] = useState<Step>('branch')
  const [selectedServiceId, setSelectedServiceId] = useState(preselectedServiceId)
  const [selectedBranchId, setSelectedBranchId] = useState('')

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(new Date().getMonth() + 1) // 1-indexed
  const [notes, setNotes] = useState('')
  const [bookingError, setBookingError] = useState<string | null>(null)

  // Preselect nearest branch once profile loads with geolocation data
  useEffect(() => {
    if (selectedBranchId) return
    const firstWithDistance = profile?.branches.find(b => b.distanceKm != null)
    if (firstWithDistance) setSelectedBranchId(firstWithDistance.id)
  }, [profile, selectedBranchId])

  const { data: availableDates = [], isLoading: datesLoading } = useGetAvailableDates(
    slug, selectedBranchId, selectedServiceId, calYear, calMonth,
    step === 'date' || step === 'slot'
  )

  const { data: slots = [], isLoading: slotsLoading } = useGetAvailableSlots(
    slug, selectedBranchId, selectedServiceId, selectedDate ?? '',
    !!selectedDate
  )

  const createBooking = useCreateBooking(slug)

  const selectedService = profile?.services.find(s => s.id === selectedServiceId)
  const selectedBranch = profile?.branches.find(b => b.id === selectedBranchId)
  const selectedSlotData = slots.find(s => s.startAt === selectedSlot)

  function handleMonthChange(year: number, month: number) {
    setCalYear(year)
    setCalMonth(month)
    setSelectedDate(null)
    setSelectedSlot(null)
  }

  function handleDateSelect(date: string) {
    setSelectedDate(date)
    setSelectedSlot(null)
    setStep('slot')
  }

  function handleSlotSelect(startAt: string) {
    setSelectedSlot(startAt)
    setStep('confirm')
  }

  async function handleConfirm() {
    if (!selectedSlot || !selectedServiceId || !selectedBranchId || !profile) return
    setBookingError(null)

    try {
      const booking = await createBooking.mutateAsync({
        tenantId: profile.tenantId,
        branchId: selectedBranchId,
        serviceId: selectedServiceId,
        startAt: selectedSlot,
        notes: notes.trim() || undefined,
      })
      router.push(`/${slug}/book/${booking.id}/confirmation`)
    } catch (e: unknown) {
      setBookingError((e as { message?: string })?.message ?? 'Error al crear la reserva')
    }
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-indigo-400" />
      </div>
    )
  }

  if (!profile) return null

  const STEPS: { key: Step; label: string }[] = [
    { key: 'branch', label: 'Sede' },
    { key: 'date', label: 'Fecha' },
    { key: 'slot', label: 'Horario' },
    { key: 'confirm', label: 'Confirmar' },
  ]

  const currentStepIndex = STEPS.findIndex(s => s.key === step)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => {
            if (step === 'branch') router.push(`/${slug}`)
            else if (step === 'date') setStep('branch')
            else if (step === 'slot') { setStep('date'); setSelectedSlot(null) }
            else if (step === 'confirm') { setStep('slot'); setSelectedSlot(null) }
          }}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="font-semibold text-gray-900 text-sm">{profile.name}</h1>
          {selectedService && <p className="text-xs text-gray-500">{selectedService.name}</p>}
        </div>
      </div>

      {/* Step indicator */}
      <div className="bg-white border-b border-gray-100 px-6 py-3">
        <div className="flex items-center gap-1 max-w-md mx-auto">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors ${
                i < currentStepIndex ? 'bg-indigo-600 text-white' :
                i === currentStepIndex ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-300' :
                'bg-gray-100 text-gray-400'
              }`}>
                {i < currentStepIndex ? <CheckCircle size={14} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 ${i < currentStepIndex ? 'bg-indigo-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">

        {/* Step: Select service (if not preselected) and branch */}
        {step === 'branch' && (
          <div className="space-y-4">
            {!preselectedServiceId && (
              <div>
                <h2 className="font-semibold text-gray-900 mb-3">Elige un servicio</h2>
                <div className="space-y-2">
                  {profile.services.map(service => (
                    <button
                      key={service.id}
                      onClick={() => setSelectedServiceId(service.id)}
                      className={`w-full text-left bg-white rounded-xl border px-4 py-3 transition-all ${
                        selectedServiceId === service.id
                          ? 'border-indigo-400 ring-2 ring-indigo-200'
                          : 'border-gray-100 hover:border-indigo-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm text-gray-900">{service.name}</p>
                          <p className="text-xs text-gray-500">{formatDuration(service.durationMinutes)}</p>
                        </div>
                        <p className="font-bold text-sm text-gray-900">{formatCurrency(service.price, service.currency)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedServiceId && (
              <div>
                <h2 className="font-semibold text-gray-900 mb-3">Elige una sede</h2>
                <div className="space-y-2">
                  {profile.branches.map(branch => (
                    <button
                      key={branch.id}
                      onClick={() => setSelectedBranchId(branch.id)}
                      className={`w-full text-left bg-white rounded-xl border px-4 py-3 transition-all ${
                        selectedBranchId === branch.id
                          ? 'border-indigo-400 ring-2 ring-indigo-200'
                          : 'border-gray-100 hover:border-indigo-200'
                      }`}
                    >
                      <p className="font-medium text-sm text-gray-900">{branch.name}</p>
                      {branch.address && <p className="text-xs text-gray-500">{branch.address}</p>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedServiceId && selectedBranchId && (
              <button
                onClick={() => setStep('date')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl text-sm transition-colors"
              >
                Continuar
              </button>
            )}
          </div>
        )}

        {/* Step: Select date */}
        {step === 'date' && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Elige una fecha</h2>
            <DatePicker
              availableDates={availableDates}
              selectedDate={selectedDate}
              onSelectDate={handleDateSelect}
              isLoading={datesLoading}
              onMonthChange={handleMonthChange}
            />
          </div>
        )}

        {/* Step: Select slot */}
        {step === 'slot' && selectedDate && (
          <div className="space-y-4">
            <div>
              <h2 className="font-semibold text-gray-900">Elige un horario</h2>
              <p className="text-sm text-gray-500 capitalize mt-0.5">{formatDate(selectedDate + 'T00:00:00')}</p>
            </div>
            <SlotPicker
              slots={slots}
              selectedSlot={selectedSlot}
              onSelectSlot={handleSlotSelect}
              isLoading={slotsLoading}
            />
            {selectedSlot && (
              <button
                onClick={() => setStep('confirm')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl text-sm transition-colors"
              >
                Continuar
              </button>
            )}
          </div>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && selectedSlotData && selectedService && selectedBranch && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Confirma tu reserva</h2>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
              <Row label="Servicio" value={selectedService.name} />
              <Row label="Sede" value={selectedBranch.name} />
              <Row label="Fecha" value={formatDate(selectedSlotData.startAt)} />
              <Row label="Horario" value={`${formatTime(selectedSlotData.startAt)} – ${formatTime(selectedSlotData.endAt)}`} />
              <Row label="Duración" value={formatDuration(selectedService.durationMinutes)} />
              <div className="border-t border-gray-100 pt-3">
                <Row label="Total" value={formatCurrency(selectedService.price, selectedService.currency)} bold />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas <span className="text-gray-400">(opcional)</span></label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Ej. Tengo alergia al maní..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            {bookingError && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{bookingError}</p>
            )}

            <button
              disabled={createBooking.isPending}
              onClick={handleConfirm}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {createBooking.isPending ? (
                <><Loader2 size={16} className="animate-spin" /> Reservando...</>
              ) : 'Confirmar reserva'}
            </button>

            <p className="text-xs text-center text-gray-400">
              Cancelación gratuita hasta {profile.cancellationWindowHours}h antes de tu cita
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={bold ? 'font-bold text-gray-900' : 'text-gray-800'}>{value}</span>
    </div>
  )
}
