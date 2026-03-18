'use client'

import { use, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, Check, Loader2, MapPin, Clock, Tag } from 'lucide-react'
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
  const [calMonth, setCalMonth] = useState(new Date().getMonth() + 1)
  const [notes, setNotes] = useState('')
  const [bookingError, setBookingError] = useState<string | null>(null)

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 size={28} className="animate-spin text-indigo-400" />
      </div>
    )
  }

  if (!profile) return null

  const STEPS: { key: Step; label: string }[] = [
    { key: 'branch', label: 'Sede' },
    { key: 'date', label: 'Fecha' },
    { key: 'slot', label: 'Hora' },
    { key: 'confirm', label: 'Confirmar' },
  ]
  const currentStepIndex = STEPS.findIndex(s => s.key === step)
  const primaryColor = profile.primaryColor ?? '#4f46e5'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-4 max-w-xl mx-auto">
          <button
            onClick={() => {
              if (step === 'branch') router.push(`/${slug}`)
              else if (step === 'date') setStep('branch')
              else if (step === 'slot') { setStep('date'); setSelectedSlot(null) }
              else if (step === 'confirm') { setStep('slot'); setSelectedSlot(null) }
            }}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors shrink-0"
          >
            <ChevronLeft size={18} className="text-gray-600" />
          </button>
          <div className="min-w-0">
            <h1 className="font-semibold text-gray-900 text-sm truncate">{profile.name}</h1>
            {selectedService && (
              <p className="text-xs text-slate-400 truncate">{selectedService.name} · {formatCurrency(selectedService.price, selectedService.currency)}</p>
            )}
          </div>
        </div>

        {/* Step indicator */}
        <div className="px-4 pb-4 max-w-xl mx-auto">
          <div className="flex items-center">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      i < currentStepIndex
                        ? 'text-white shadow-sm'
                        : i === currentStepIndex
                        ? 'ring-2 ring-offset-1 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                    style={
                      i <= currentStepIndex
                        ? { backgroundColor: primaryColor, ringColor: primaryColor }
                        : undefined
                    }
                  >
                    {i < currentStepIndex ? <Check size={13} strokeWidth={3} /> : i + 1}
                  </div>
                  <span className={`text-[10px] mt-1 font-medium ${i === currentStepIndex ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className="flex-1 h-0.5 mx-2 mb-4 rounded-full transition-all"
                    style={{
                      backgroundColor: i < currentStepIndex ? primaryColor : '#e2e8f0',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-5 space-y-4">

        {/* Step: Service + Branch */}
        {step === 'branch' && (
          <div className="space-y-5">
            {!preselectedServiceId && (
              <div>
                <h2 className="font-semibold text-gray-900 mb-3 text-sm">Elige un servicio</h2>
                <div className="space-y-2">
                  {profile.services.map(service => (
                    <button
                      key={service.id}
                      onClick={() => setSelectedServiceId(service.id)}
                      className={`w-full text-left bg-white rounded-2xl border transition-all shadow-sm ${
                        selectedServiceId === service.id
                          ? 'border-indigo-400 ring-2 ring-indigo-100'
                          : 'border-gray-100 hover:border-indigo-200'
                      }`}
                    >
                      <div className="px-4 py-3.5 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                          <Tag size={15} className="text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900">{service.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Clock size={11} className="text-slate-400" />
                            <span className="text-xs text-slate-400">{formatDuration(service.durationMinutes)}</span>
                          </div>
                        </div>
                        <p className="font-bold text-sm text-gray-900 shrink-0">{formatCurrency(service.price, service.currency)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedServiceId && (
              <div>
                <h2 className="font-semibold text-gray-900 mb-3 text-sm">Elige una sede</h2>
                <div className="space-y-2">
                  {profile.branches.map(branch => (
                    <button
                      key={branch.id}
                      onClick={() => setSelectedBranchId(branch.id)}
                      className={`w-full text-left bg-white rounded-2xl border transition-all shadow-sm ${
                        selectedBranchId === branch.id
                          ? 'border-indigo-400 ring-2 ring-indigo-100'
                          : 'border-gray-100 hover:border-indigo-200'
                      }`}
                    >
                      <div className="px-4 py-3.5 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                          <MapPin size={15} className="text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900">{branch.name}</p>
                          {branch.address && <p className="text-xs text-slate-400 truncate mt-0.5">{branch.address}</p>}
                        </div>
                        {branch.distanceKm != null && (
                          <span className="shrink-0 text-xs bg-indigo-50 text-indigo-600 font-semibold px-2 py-0.5 rounded-full">
                            {branch.distanceKm < 1
                              ? `${Math.round(branch.distanceKm * 1000)} m`
                              : `${branch.distanceKm.toFixed(1)} km`}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedServiceId && selectedBranchId && (
              <button
                onClick={() => setStep('date')}
                className="w-full text-white font-semibold py-3.5 rounded-2xl text-sm transition-all shadow-sm"
                style={{ backgroundColor: primaryColor }}
              >
                Continuar
              </button>
            )}
          </div>
        )}

        {/* Step: Date */}
        {step === 'date' && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900 text-sm">Elige una fecha</h2>
            <DatePicker
              availableDates={availableDates}
              selectedDate={selectedDate}
              onSelectDate={handleDateSelect}
              isLoading={datesLoading}
              onMonthChange={handleMonthChange}
            />
          </div>
        )}

        {/* Step: Slot */}
        {step === 'slot' && selectedDate && (
          <div className="space-y-4">
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">Elige un horario</h2>
              <p className="text-xs text-slate-400 capitalize mt-0.5">{formatDate(selectedDate + 'T00:00:00')}</p>
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
                className="w-full text-white font-semibold py-3.5 rounded-2xl text-sm transition-all shadow-sm"
                style={{ backgroundColor: primaryColor }}
              >
                Continuar
              </button>
            )}
          </div>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && selectedSlotData && selectedService && selectedBranch && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900 text-sm">Confirma tu reserva</h2>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div
                className="px-5 py-3 text-xs font-semibold tracking-wide text-white/90"
                style={{ backgroundColor: primaryColor }}
              >
                {profile.name}
              </div>
              <div className="px-5 py-4 space-y-3">
                <Row label="Servicio" value={selectedService.name} />
                <Row label="Sede" value={selectedBranch.name} />
                <Row label="Fecha" value={formatDate(selectedSlotData.startAt)} />
                <Row label="Horario" value={`${formatTime(selectedSlotData.startAt)} – ${formatTime(selectedSlotData.endAt)}`} />
                <Row label="Duración" value={formatDuration(selectedService.durationMinutes)} />
                <div className="border-t border-gray-100 pt-3">
                  <Row label="Total" value={formatCurrency(selectedService.price, selectedService.currency)} bold />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Notas <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Ej. Tengo alergia al maní..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
              />
            </div>

            {bookingError && (
              <div className="text-sm text-red-500 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
                {bookingError}
              </div>
            )}

            <button
              disabled={createBooking.isPending}
              onClick={handleConfirm}
              className="w-full text-white font-semibold py-3.5 rounded-2xl text-sm transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              {createBooking.isPending ? (
                <><Loader2 size={16} className="animate-spin" /> Reservando...</>
              ) : 'Confirmar reserva'}
            </button>

            <p className="text-xs text-center text-slate-400">
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
      <span className="text-slate-400">{label}</span>
      <span className={bold ? 'font-bold text-gray-900 text-base' : 'text-gray-800 font-medium'}>{value}</span>
    </div>
  )
}
