'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRAGKnowledgeBase, validateFile } from '@/lib/ragKnowledgeBase'
import { callAIAgent } from '@/lib/aiAgent'
import { cn } from '@/lib/utils'
import {
  FiPhone,
  FiGrid,
  FiBook,
  FiSettings,
  FiClock,
  FiCalendar,
  FiHelpCircle,
  FiUpload,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiMenu,
  FiSearch,
  FiFilter,
  FiPhoneCall,
  FiPhoneOff,
  FiMic,
  FiMicOff,
  FiCheck,
  FiAlertCircle,
  FiFile,
  FiActivity,
  FiChevronDown,
  FiRefreshCw,
} from 'react-icons/fi'

// ===== CONSTANTS =====
const VOICE_AGENT_ID = '699caba6d7658627bf6b63c5'
const RAG_ID = '699cab70b45a5c2df18dacab'

// ===== MOCK DATA =====
const MOCK_STATS = {
  totalCalls: 24,
  appointmentsBooked: 8,
  faqsAnswered: 14,
  avgDuration: '3:42',
}

const MOCK_RECENT_CALLS = [
  { id: '1', caller: '(415) 555-0198', duration: '4:12', type: 'FAQ', outcome: 'Answered', time: '10:45 AM' },
  { id: '2', caller: '(628) 555-0234', duration: '6:30', type: 'Booking', outcome: 'Booked', time: '10:22 AM' },
  { id: '3', caller: '(510) 555-0176', duration: '1:08', type: 'Availability', outcome: 'Answered', time: '9:58 AM' },
  { id: '4', caller: '(650) 555-0312', duration: '0:45', type: 'FAQ', outcome: 'Missed', time: '9:30 AM' },
  { id: '5', caller: '(925) 555-0489', duration: '5:15', type: 'Booking', outcome: 'Booked', time: '9:10 AM' },
]

const MOCK_APPOINTMENTS = [
  { id: '1', time: '11:30 AM', caller: 'Sarah Mitchell', purpose: 'New Patient Consultation' },
  { id: '2', time: '1:00 PM', caller: 'James Rodriguez', purpose: 'Follow-up Visit' },
  { id: '3', time: '2:30 PM', caller: 'Emily Chen', purpose: 'Annual Check-up' },
  { id: '4', time: '4:00 PM', caller: 'Robert Williams', purpose: 'Specialist Referral' },
]

const MOCK_CALL_LOG = [
  { id: '1', dateTime: '2026-02-23 10:45 AM', caller: '(415) 555-0198', duration: '4:12', type: 'FAQ', outcome: 'Answered', summary: 'Caller asked about office hours and accepted treatments. Provided information from knowledge base.' },
  { id: '2', dateTime: '2026-02-23 10:22 AM', caller: '(628) 555-0234', duration: '6:30', type: 'Booking', outcome: 'Booked', summary: 'Booked appointment for dental cleaning on March 3rd at 2:00 PM. New patient intake form discussed.' },
  { id: '3', dateTime: '2026-02-23 9:58 AM', caller: '(510) 555-0176', duration: '1:08', type: 'Availability', outcome: 'Answered', summary: 'Checked availability for next Tuesday afternoon. Three slots available, caller will call back.' },
  { id: '4', dateTime: '2026-02-23 9:30 AM', caller: '(650) 555-0312', duration: '0:45', type: 'FAQ', outcome: 'Missed', summary: 'Call disconnected before response. Attempted callback logged.' },
  { id: '5', dateTime: '2026-02-23 9:10 AM', caller: '(925) 555-0489', duration: '5:15', type: 'Booking', outcome: 'Booked', summary: 'Scheduled follow-up appointment for March 5th at 10:00 AM. Patient requested reminder call.' },
  { id: '6', dateTime: '2026-02-22 4:32 PM', caller: '(408) 555-0122', duration: '3:40', type: 'FAQ', outcome: 'Answered', summary: 'Inquired about insurance plans accepted. Provided comprehensive list from knowledge base.' },
  { id: '7', dateTime: '2026-02-22 3:15 PM', caller: '(707) 555-0298', duration: '7:22', type: 'Booking', outcome: 'Booked', summary: 'Booked initial consultation for orthodontics. Multiple time slots discussed before selection.' },
  { id: '8', dateTime: '2026-02-22 2:48 PM', caller: '(831) 555-0456', duration: '2:10', type: 'Availability', outcome: 'Answered', summary: 'Checked same-day availability for emergency visit. Directed to nearest available slot.' },
  { id: '9', dateTime: '2026-02-22 1:20 PM', caller: '(510) 555-0333', duration: '1:55', type: 'FAQ', outcome: 'Answered', summary: 'Asked about parking facilities and accessibility options at the clinic.' },
  { id: '10', dateTime: '2026-02-22 11:05 AM', caller: '(415) 555-0567', duration: '4:48', type: 'Booking', outcome: 'Booked', summary: 'Rescheduled existing appointment from Feb 28 to March 1. Confirmed new time slot.' },
  { id: '11', dateTime: '2026-02-22 10:30 AM', caller: '(650) 555-0789', duration: '0:32', type: 'FAQ', outcome: 'Missed', summary: 'Caller hung up during greeting. No voicemail left.' },
  { id: '12', dateTime: '2026-02-21 4:10 PM', caller: '(925) 555-0145', duration: '3:05', type: 'FAQ', outcome: 'Answered', summary: 'Requested information about teeth whitening procedures and pricing.' },
  { id: '13', dateTime: '2026-02-21 3:22 PM', caller: '(408) 555-0678', duration: '5:50', type: 'Booking', outcome: 'Booked', summary: 'Booked family appointments for three members on the same day. Special accommodation noted.' },
  { id: '14', dateTime: '2026-02-21 2:00 PM', caller: '(707) 555-0901', duration: '2:35', type: 'Availability', outcome: 'Answered', summary: 'Checked availability for weekend appointments. Informed about Saturday morning slots.' },
  { id: '15', dateTime: '2026-02-21 12:45 PM', caller: '(831) 555-0234', duration: '1:20', type: 'FAQ', outcome: 'Answered', summary: 'Asked about post-operative care instructions for recent procedure.' },
  { id: '16', dateTime: '2026-02-21 11:15 AM', caller: '(510) 555-0890', duration: '6:10', type: 'Booking', outcome: 'Booked', summary: 'Booked emergency dental appointment for same day. Prioritized in schedule.' },
]

// ===== HELPER FUNCTIONS =====
function getTypeBadgeClasses(type: string): string {
  switch (type) {
    case 'FAQ': return 'bg-blue-100 text-blue-800 border border-blue-200'
    case 'Booking': return 'bg-green-100 text-green-800 border border-green-200'
    case 'Availability': return 'bg-amber-100 text-amber-800 border border-amber-200'
    default: return 'bg-muted text-muted-foreground'
  }
}

function getOutcomeBadgeClasses(outcome: string): string {
  switch (outcome) {
    case 'Answered': return 'bg-emerald-100 text-emerald-800 border border-emerald-200'
    case 'Booked': return 'bg-purple-100 text-purple-800 border border-purple-200'
    case 'Missed': return 'bg-red-100 text-red-800 border border-red-200'
    default: return 'bg-muted text-muted-foreground'
  }
}

function formatFileSize(bytes: number | undefined): string {
  if (!bytes) return '--'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

// ===== STAT CARD =====
function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string | number; accent?: boolean }) {
  return (
    <div className={cn("bg-card rounded-lg shadow-md p-6 flex items-start gap-4 border border-border/30", accent && "ring-1 ring-accent/30")}>
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">{label}</p>
        <p className="text-2xl font-serif font-bold text-foreground mt-1">{value}</p>
      </div>
    </div>
  )
}

// ===== DASHBOARD SCREEN =====
function DashboardScreen({ showSample, onNavigate }: { showSample: boolean; onNavigate: (screen: string) => void }) {
  const stats = showSample ? MOCK_STATS : { totalCalls: 0, appointmentsBooked: 0, faqsAnswered: 0, avgDuration: '0:00' }
  const recentCalls = showSample ? MOCK_RECENT_CALLS : []
  const appointments = showSample ? MOCK_APPOINTMENTS : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1" style={{ lineHeight: '1.65' }}>Overview of your AI receptionist activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<FiPhone size={22} />} label="Total Calls Today" value={stats.totalCalls} />
        <StatCard icon={<FiCalendar size={22} />} label="Appointments Booked" value={stats.appointmentsBooked} accent />
        <StatCard icon={<FiHelpCircle size={22} />} label="FAQs Answered" value={stats.faqsAnswered} />
        <StatCard icon={<FiClock size={22} />} label="Avg Call Duration" value={stats.avgDuration} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-lg shadow-md border border-border/30">
          <div className="p-6 border-b border-border/30">
            <h2 className="text-lg font-serif font-semibold text-foreground">Recent Calls</h2>
          </div>
          {recentCalls.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <FiPhone className="mx-auto mb-3 opacity-40" size={32} />
              <p className="text-sm">No call data yet. Toggle &quot;Sample Data&quot; to preview.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left p-4 font-medium text-muted-foreground tracking-wide text-xs uppercase">Caller</th>
                    <th className="text-left p-4 font-medium text-muted-foreground tracking-wide text-xs uppercase">Duration</th>
                    <th className="text-left p-4 font-medium text-muted-foreground tracking-wide text-xs uppercase">Type</th>
                    <th className="text-left p-4 font-medium text-muted-foreground tracking-wide text-xs uppercase">Outcome</th>
                    <th className="text-left p-4 font-medium text-muted-foreground tracking-wide text-xs uppercase">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCalls.map((call) => (
                    <tr key={call.id} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium text-foreground">{call.caller}</td>
                      <td className="p-4 text-muted-foreground">{call.duration}</td>
                      <td className="p-4"><span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", getTypeBadgeClasses(call.type))}>{call.type}</span></td>
                      <td className="p-4"><span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", getOutcomeBadgeClasses(call.outcome))}>{call.outcome}</span></td>
                      <td className="p-4 text-muted-foreground">{call.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-card rounded-lg shadow-md border border-border/30 flex flex-col">
          <div className="p-6 border-b border-border/30">
            <h2 className="text-lg font-serif font-semibold text-foreground">Today&apos;s Appointments</h2>
          </div>
          {appointments.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground flex-1 flex flex-col items-center justify-center">
              <FiCalendar className="mx-auto mb-3 opacity-40" size={32} />
              <p className="text-sm">No appointments scheduled.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/20 flex-1">
              {appointments.map((appt) => (
                <div key={appt.id} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                      <FiClock size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm">{appt.caller}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{appt.time} - {appt.purpose}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="p-4 border-t border-border/30">
            <button
              onClick={() => onNavigate('knowledge')}
              className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <FiBook size={16} />
              Manage Knowledge Base
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ===== CALL HISTORY SCREEN =====
function CallHistoryScreen({ showSample }: { showSample: boolean }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [outcomeFilter, setOutcomeFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const perPage = 8

  const allCalls = showSample ? MOCK_CALL_LOG : []

  const filteredCalls = allCalls.filter((call) => {
    const matchesSearch = !searchTerm || call.caller.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesOutcome = outcomeFilter === 'All' || call.outcome === outcomeFilter
    return matchesSearch && matchesOutcome
  })

  const totalPages = Math.max(1, Math.ceil(filteredCalls.length / perPage))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedCalls = filteredCalls.slice((safePage - 1) * perPage, safePage * perPage)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground tracking-tight">Call History</h1>
        <p className="text-sm text-muted-foreground mt-1" style={{ lineHeight: '1.65' }}>Complete log of all calls handled by your AI receptionist</p>
      </div>

      <div className="bg-card rounded-lg shadow-md border border-border/30 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Search by phone number..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              className="w-full pl-9 pr-4 py-2.5 bg-background border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <select
              value={outcomeFilter}
              onChange={(e) => { setOutcomeFilter(e.target.value); setCurrentPage(1) }}
              className="pl-9 pr-8 py-2.5 bg-background border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer"
            >
              <option value="All">All Outcomes</option>
              <option value="Answered">Answered</option>
              <option value="Booked">Booked</option>
              <option value="Missed">Missed</option>
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-md border border-border/30">
        {paginatedCalls.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <FiPhone className="mx-auto mb-3 opacity-40" size={32} />
            <p className="text-sm">{showSample ? 'No calls match your filters.' : 'No call history yet. Toggle "Sample Data" to preview.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left p-4 font-medium text-muted-foreground tracking-wide text-xs uppercase">Date/Time</th>
                  <th className="text-left p-4 font-medium text-muted-foreground tracking-wide text-xs uppercase">Caller</th>
                  <th className="text-left p-4 font-medium text-muted-foreground tracking-wide text-xs uppercase">Duration</th>
                  <th className="text-left p-4 font-medium text-muted-foreground tracking-wide text-xs uppercase">Type</th>
                  <th className="text-left p-4 font-medium text-muted-foreground tracking-wide text-xs uppercase">Outcome</th>
                  <th className="text-left p-4 font-medium text-muted-foreground tracking-wide text-xs uppercase">Details</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCalls.map((call) => (
                  <React.Fragment key={call.id}>
                    <tr className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-muted-foreground whitespace-nowrap">{call.dateTime}</td>
                      <td className="p-4 font-medium text-foreground">{call.caller}</td>
                      <td className="p-4 text-muted-foreground">{call.duration}</td>
                      <td className="p-4"><span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", getTypeBadgeClasses(call.type))}>{call.type}</span></td>
                      <td className="p-4"><span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", getOutcomeBadgeClasses(call.outcome))}>{call.outcome}</span></td>
                      <td className="p-4">
                        <button
                          onClick={() => setExpandedRow(expandedRow === call.id ? null : call.id)}
                          className="text-primary hover:text-primary/80 text-xs font-medium underline underline-offset-2 transition-colors"
                        >
                          {expandedRow === call.id ? 'Hide' : 'View'}
                        </button>
                      </td>
                    </tr>
                    {expandedRow === call.id && (
                      <tr className="bg-muted/20">
                        <td colSpan={6} className="p-4 text-sm text-muted-foreground" style={{ lineHeight: '1.65' }}>
                          <span className="font-medium text-foreground">Summary: </span>{call.summary}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filteredCalls.length > perPage && (
          <div className="flex items-center justify-between p-4 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              Showing {((safePage - 1) * perPage) + 1}-{Math.min(safePage * perPage, filteredCalls.length)} of {filteredCalls.length} calls
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                disabled={safePage <= 1}
                className="p-2 rounded-lg border border-border/50 text-muted-foreground hover:bg-muted/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <FiChevronLeft size={16} />
              </button>
              <span className="text-sm text-foreground font-medium px-2">{safePage} / {totalPages}</span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
                disabled={safePage >= totalPages}
                className="p-2 rounded-lg border border-border/50 text-muted-foreground hover:bg-muted/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ===== KNOWLEDGE BASE SCREEN =====
function KnowledgeBaseScreen() {
  const { documents, loading, error, fetchDocuments, uploadDocument, removeDocuments } = useRAGKnowledgeBase()
  const [dragActive, setDragActive] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [deletingFile, setDeletingFile] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchDocuments(RAG_ID)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFileUpload = useCallback(async (files: FileList | File[]) => {
    setUploadStatus(null)
    const fileArray = Array.from(files)
    for (const file of fileArray) {
      const validation = validateFile(file)
      if (!validation.valid) {
        setUploadStatus({ type: 'error', message: validation.error || 'Invalid file type' })
        return
      }
      const result = await uploadDocument(RAG_ID, file)
      if (result.success) {
        setUploadStatus({ type: 'success', message: '"' + file.name + '" uploaded and training started.' })
      } else {
        setUploadStatus({ type: 'error', message: result.error || 'Upload failed' })
      }
    }
  }, [uploadDocument])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files)
    }
  }, [handleFileUpload])

  const handleDelete = useCallback(async (fileName: string) => {
    setDeletingFile(fileName)
    setUploadStatus(null)
    const result = await removeDocuments(RAG_ID, [fileName])
    if (result.success) {
      setUploadStatus({ type: 'success', message: '"' + fileName + '" has been deleted.' })
    } else {
      setUploadStatus({ type: 'error', message: result.error || 'Delete failed' })
    }
    setDeletingFile(null)
  }, [removeDocuments])

  const docList = Array.isArray(documents) ? documents : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground tracking-tight">Knowledge Base</h1>
        <p className="text-sm text-muted-foreground mt-1" style={{ lineHeight: '1.65' }}>Upload business documents to train your AI receptionist</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={cn("bg-card rounded-lg shadow-md border-2 border-dashed p-8 text-center transition-colors cursor-pointer", dragActive ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50")}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileUpload(e.target.files)
              e.target.value = ''
            }
          }}
        />
        <FiUpload className="mx-auto mb-4 text-muted-foreground" size={36} />
        <p className="text-sm font-medium text-foreground mb-1">
          {dragActive ? 'Drop files here...' : 'Drag and drop files here, or click to browse'}
        </p>
        <p className="text-xs text-muted-foreground">Supports PDF, DOCX, TXT</p>
      </div>

      {uploadStatus && (
        <div className={cn("rounded-lg p-4 flex items-start gap-3 text-sm", uploadStatus.type === 'success' ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200")}>
          {uploadStatus.type === 'success' ? <FiCheck size={18} className="flex-shrink-0 mt-0.5" /> : <FiAlertCircle size={18} className="flex-shrink-0 mt-0.5" />}
          <p>{uploadStatus.message}</p>
        </div>
      )}

      {error && !uploadStatus && (
        <div className="rounded-lg p-4 flex items-start gap-3 text-sm bg-red-50 text-red-800 border border-red-200">
          <FiAlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-card rounded-lg shadow-md border border-border/30">
        <div className="p-6 border-b border-border/30 flex items-center justify-between">
          <h2 className="text-lg font-serif font-semibold text-foreground">Documents</h2>
          {loading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              Loading...
            </div>
          )}
        </div>
        {docList.length === 0 && !loading ? (
          <div className="p-12 text-center text-muted-foreground">
            <FiBook className="mx-auto mb-3 opacity-40" size={32} />
            <p className="text-sm font-medium mb-1">No documents uploaded yet</p>
            <p className="text-xs">Upload your business FAQs, service descriptions, or policies to train your receptionist</p>
          </div>
        ) : docList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left p-4 font-medium text-muted-foreground tracking-wide text-xs uppercase">File Name</th>
                  <th className="text-left p-4 font-medium text-muted-foreground tracking-wide text-xs uppercase">Type</th>
                  <th className="text-left p-4 font-medium text-muted-foreground tracking-wide text-xs uppercase">Size</th>
                  <th className="text-left p-4 font-medium text-muted-foreground tracking-wide text-xs uppercase">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground tracking-wide text-xs uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {docList.map((doc, idx) => (
                  <tr key={doc?.id ?? idx} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <FiFile size={16} className="text-muted-foreground flex-shrink-0" />
                        <span className="truncate max-w-[200px]">{doc?.fileName ?? 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground uppercase text-xs">{doc?.fileType ?? '--'}</td>
                    <td className="p-4 text-muted-foreground">{formatFileSize(doc?.fileSize)}</td>
                    <td className="p-4">
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", doc?.status === 'active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : doc?.status === 'processing' ? 'bg-amber-100 text-amber-800 border border-amber-200' : doc?.status === 'failed' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-muted text-muted-foreground')}>
                        {doc?.status === 'active' ? 'Active' : doc?.status === 'processing' ? 'Processing' : doc?.status === 'failed' ? 'Failed' : doc?.status ?? 'Unknown'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => doc?.fileName && handleDelete(doc.fileName)}
                        disabled={deletingFile === doc?.fileName}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                        title="Delete document"
                      >
                        {deletingFile === doc?.fileName ? (
                          <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                        ) : (
                          <FiTrash2 size={16} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  )
}

// ===== SETTINGS SCREEN =====
function SettingsScreen() {
  const [businessName, setBusinessName] = useState('Heritage Dental Care')
  const [businessPhone, setBusinessPhone] = useState('(415) 555-0100')
  const [operatingHours, setOperatingHours] = useState<Record<string, { open: string; close: string }>>({
    mon: { open: '09:00', close: '17:00' },
    tue: { open: '09:00', close: '17:00' },
    wed: { open: '09:00', close: '17:00' },
    thu: { open: '09:00', close: '17:00' },
    fri: { open: '09:00', close: '15:00' },
  })
  const [greeting, setGreeting] = useState('Thank you for calling Heritage Dental Care. How may I assist you today?')
  const [defaultDuration, setDefaultDuration] = useState('30')
  const [settingsSaved, setSettingsSaved] = useState(false)

  const [calendarStatus, setCalendarStatus] = useState<'connected' | 'checking' | 'verified' | 'error'>('connected')
  const [calendarMessage, setCalendarMessage] = useState('')

  const handleReconnectCalendar = async () => {
    setCalendarStatus('checking')
    setCalendarMessage('')
    try {
      const result = await callAIAgent('List all my available Google Calendars using GOOGLECALENDAR_LIST_CALENDARS. Just list the calendar names.', VOICE_AGENT_ID)
      if (result && result.success) {
        setCalendarStatus('verified')
        setCalendarMessage('Connection verified successfully. Google Calendar is active and accessible.')
        setTimeout(() => {
          setCalendarStatus('connected')
          setCalendarMessage('')
        }, 5000)
      } else {
        setCalendarStatus('error')
        setCalendarMessage('Could not verify connection. The agent may need re-authentication in Lyzr Studio.')
      }
    } catch (_e) {
      setCalendarStatus('error')
      setCalendarMessage('Failed to reach the agent. Please check your network and try again.')
    }
  }

  const handleSaveSettings = () => {
    setSettingsSaved(true)
    setTimeout(() => setSettingsSaved(false), 3000)
  }

  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected' | 'ended'>('idle')
  const [liveTranscript, setLiveTranscript] = useState('')
  const [isMuted, setIsMuted] = useState(false)
  const isMutedRef = useRef(false)
  const wsRef = useRef<WebSocket | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const nextPlayTimeRef = useRef(0)

  const startCall = async () => {
    setCallStatus('connecting')
    setLiveTranscript('')
    try {
      const res = await fetch('https://voice-sip.studio.lyzr.ai/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: VOICE_AGENT_ID })
      })
      const data = await res.json()
      const sampleRate = data.audioConfig?.sampleRate || 24000

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream

      const audioContext = new AudioContext({ sampleRate })
      audioContextRef.current = audioContext
      nextPlayTimeRef.current = audioContext.currentTime

      const source = audioContext.createMediaStreamSource(stream)
      const processor = audioContext.createScriptProcessor(4096, 1, 1)
      processorRef.current = processor

      const silentGain = audioContext.createGain()
      silentGain.gain.value = 0
      silentGain.connect(audioContext.destination)

      const ws = new WebSocket(data.wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setCallStatus('connected')
        source.connect(processor)
        processor.connect(silentGain)

        processor.onaudioprocess = (e) => {
          if (isMutedRef.current) return
          const float32 = e.inputBuffer.getChannelData(0)
          const int16 = new Int16Array(float32.length)
          for (let i = 0; i < float32.length; i++) {
            const s = Math.max(-1, Math.min(1, float32[i]))
            int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
          }
          const bytes = new Uint8Array(int16.buffer)
          let binary = ''
          for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i])
          }
          const base64 = btoa(binary)
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'audio', audio: base64, sampleRate }))
          }
        }
      }

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.type === 'audio' && msg.audio) {
            const binaryStr = atob(msg.audio)
            const byteArr = new Uint8Array(binaryStr.length)
            for (let i = 0; i < binaryStr.length; i++) {
              byteArr[i] = binaryStr.charCodeAt(i)
            }
            const int16Data = new Int16Array(byteArr.buffer)
            const float32Data = new Float32Array(int16Data.length)
            for (let i = 0; i < int16Data.length; i++) {
              float32Data[i] = int16Data[i] / 0x8000
            }
            if (audioContextRef.current) {
              const ctx = audioContextRef.current
              const buffer = ctx.createBuffer(1, float32Data.length, sampleRate)
              buffer.getChannelData(0).set(float32Data)
              const src = ctx.createBufferSource()
              src.buffer = buffer
              src.connect(ctx.destination)
              const now = ctx.currentTime
              const startTime = Math.max(now, nextPlayTimeRef.current)
              src.start(startTime)
              nextPlayTimeRef.current = startTime + buffer.duration
            }
          } else if (msg.type === 'transcript') {
            setLiveTranscript(msg.text || msg.transcript || '')
          }
        } catch (_e) {
          // ignore parse errors
        }
      }

      ws.onclose = () => {
        setCallStatus('ended')
      }

      ws.onerror = () => {
        setCallStatus('ended')
      }
    } catch (_e) {
      setCallStatus('ended')
    }
  }

  const endCall = () => {
    wsRef.current?.close()
    processorRef.current?.disconnect()
    mediaStreamRef.current?.getTracks().forEach(t => t.stop())
    audioContextRef.current?.close()
    wsRef.current = null
    audioContextRef.current = null
    mediaStreamRef.current = null
    processorRef.current = null
    nextPlayTimeRef.current = 0
    setCallStatus('ended')
  }

  const toggleMute = () => {
    const next = !isMuted
    setIsMuted(next)
    isMutedRef.current = next
  }

  useEffect(() => {
    return () => {
      wsRef.current?.close()
      processorRef.current?.disconnect()
      mediaStreamRef.current?.getTracks().forEach(t => t.stop())
      audioContextRef.current?.close()
    }
  }, [])

  const dayLabels: Record<string, string> = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday' }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1" style={{ lineHeight: '1.65' }}>Configure your business details and AI receptionist preferences</p>
      </div>

      {/* Business Info */}
      <div className="bg-card rounded-lg shadow-md border border-border/30">
        <div className="p-6 border-b border-border/30">
          <h2 className="text-lg font-serif font-semibold text-foreground">Business Information</h2>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-muted-foreground tracking-wide uppercase mb-1.5">Business Name</label>
            <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full px-4 py-2.5 bg-background border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground tracking-wide uppercase mb-1.5">Phone Number</label>
            <input type="tel" value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} className="w-full px-4 py-2.5 bg-background border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground tracking-wide uppercase mb-2">Operating Hours</label>
            <div className="space-y-2">
              {Object.entries(operatingHours).map(([day, hours]) => (
                <div key={day} className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                  <span className="w-24 text-sm text-foreground font-medium">{dayLabels[day] ?? day}</span>
                  <input type="time" value={hours.open} onChange={(e) => setOperatingHours(prev => ({ ...prev, [day]: { ...prev[day], open: e.target.value } }))} className="px-3 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  <span className="text-muted-foreground text-sm">to</span>
                  <input type="time" value={hours.close} onChange={(e) => setOperatingHours(prev => ({ ...prev, [day]: { ...prev[day], close: e.target.value } }))} className="px-3 py-2 bg-background border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSaveSettings}
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Save Changes
            </button>
            {settingsSaved && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-700">
                <FiCheck size={16} />
                Settings saved
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Calendar Connection */}
      <div className="bg-card rounded-lg shadow-md border border-border/30">
        <div className="p-6 border-b border-border/30">
          <h2 className="text-lg font-serif font-semibold text-foreground">Calendar Connection</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-3 h-3 rounded-full",
                calendarStatus === 'error' ? 'bg-red-500' : calendarStatus === 'verified' ? 'bg-emerald-500' : 'bg-emerald-500 animate-pulse'
              )} />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {calendarStatus === 'checking' ? 'Verifying connection...' :
                   calendarStatus === 'verified' ? 'Google Calendar Verified' :
                   calendarStatus === 'error' ? 'Connection Issue' :
                   'Google Calendar Connected'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {calendarStatus === 'checking' ? 'Contacting Google Calendar via the agent...' :
                   'Appointments will be synced automatically'}
                </p>
              </div>
            </div>
            <button
              onClick={handleReconnectCalendar}
              disabled={calendarStatus === 'checking'}
              className={cn(
                "flex items-center gap-2 px-4 py-2 border border-border/50 rounded-lg text-sm font-medium transition-colors",
                calendarStatus === 'checking'
                  ? "opacity-60 cursor-not-allowed text-muted-foreground"
                  : "text-foreground hover:bg-muted/30"
              )}
            >
              <FiRefreshCw size={14} className={calendarStatus === 'checking' ? 'animate-spin' : ''} />
              {calendarStatus === 'checking' ? 'Checking...' : 'Reconnect'}
            </button>
          </div>
          {calendarMessage && (
            <div className={cn(
              "rounded-lg p-3 flex items-start gap-3 text-sm",
              calendarStatus === 'verified'
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            )}>
              {calendarStatus === 'verified'
                ? <FiCheck size={16} className="flex-shrink-0 mt-0.5" />
                : <FiAlertCircle size={16} className="flex-shrink-0 mt-0.5" />}
              <p>{calendarMessage}</p>
            </div>
          )}
        </div>
      </div>

      {/* Voice Agent Card */}
      <div className="bg-card rounded-lg shadow-md border border-border/30">
        <div className="p-6 border-b border-border/30">
          <h2 className="text-lg font-serif font-semibold text-foreground">Voice Agent</h2>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <p className="text-sm font-medium text-foreground">Voice Receptionist Active</p>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">ID: {VOICE_AGENT_ID}</p>
            </div>
          </div>

          <div className="bg-background rounded-lg border border-border/50 p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Test Call</h3>

            {callStatus === 'idle' && (
              <button onClick={startCall} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                <FiPhoneCall size={16} />
                Start Test Call
              </button>
            )}

            {callStatus === 'connecting' && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                Connecting to voice agent...
              </div>
            )}

            {callStatus === 'connected' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-medium text-emerald-700">Connected -- Speak into your microphone</span>
                </div>

                {liveTranscript && (
                  <div className="bg-muted/40 rounded-lg p-3 text-sm text-foreground" style={{ lineHeight: '1.65' }}>
                    <span className="text-xs font-medium text-muted-foreground block mb-1">Live Transcript</span>
                    {liveTranscript}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button onClick={toggleMute} className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors", isMuted ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-muted text-foreground border border-border/50")}>
                    {isMuted ? <FiMicOff size={16} /> : <FiMic size={16} />}
                    {isMuted ? 'Unmute' : 'Mute'}
                  </button>
                  <button onClick={endCall} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
                    <FiPhoneOff size={16} />
                    End Call
                  </button>
                </div>
              </div>
            )}

            {callStatus === 'ended' && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Call ended.</p>
                <button onClick={() => { setCallStatus('idle'); setLiveTranscript('') }} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                  <FiPhoneCall size={16} />
                  Start New Call
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Receptionist Preferences */}
      <div className="bg-card rounded-lg shadow-md border border-border/30">
        <div className="p-6 border-b border-border/30">
          <h2 className="text-lg font-serif font-semibold text-foreground">Receptionist Preferences</h2>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-muted-foreground tracking-wide uppercase mb-1.5">Greeting Message</label>
            <textarea value={greeting} onChange={(e) => setGreeting(e.target.value)} rows={3} className="w-full px-4 py-2.5 bg-background border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" style={{ lineHeight: '1.65' }} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground tracking-wide uppercase mb-1.5">Default Appointment Duration</label>
            <div className="relative">
              <select value={defaultDuration} onChange={(e) => setDefaultDuration(e.target.value)} className="w-full px-4 py-2.5 bg-background border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer">
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ===== MAIN PAGE EXPORT =====
export default function Page() {
  const [activeScreen, setActiveScreen] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showSample, setShowSample] = useState(false)

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiGrid },
    { id: 'calls', label: 'Call History', icon: FiPhone },
    { id: 'knowledge', label: 'Knowledge Base', icon: FiBook },
    { id: 'settings', label: 'Settings', icon: FiSettings },
  ]

  const handleNavigate = (screen: string) => {
    setActiveScreen(screen)
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={cn("fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 lg:translate-x-0 bg-card border-r border-border/30 shadow-lg lg:shadow-none", sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
          {/* Brand header */}
          <div className="p-6 border-b border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                <FiPhone size={20} />
              </div>
              <div>
                <h1 className="font-serif font-bold text-foreground text-lg tracking-tight">VoiceDesk AI</h1>
                <p className="text-xs text-muted-foreground">Smart Receptionist</p>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeScreen === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors", isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground")}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              )
            })}
          </nav>

          {/* Agent info footer */}
          <div className="p-4 border-t border-border/30">
            <div className="bg-background rounded-lg p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">Agent Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-foreground font-medium">Voice Receptionist</span>
              </div>
              <p className="text-xs text-muted-foreground font-mono truncate">ID: {VOICE_AGENT_ID}</p>
              <div className="flex items-center gap-2 mt-1">
                <FiActivity size={12} className="text-emerald-500" />
                <span className="text-xs text-emerald-700">Active and listening</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main area */}
        <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
          {/* Top bar */}
          <header className="h-16 border-b border-border/30 bg-card flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors">
              <FiMenu size={20} />
            </button>
            <div className="hidden lg:block">
              <h2 className="text-sm font-medium text-foreground">{navItems.find(n => n.id === activeScreen)?.label ?? 'Dashboard'}</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground font-medium">Sample Data</span>
              <button
                onClick={() => setShowSample(!showSample)}
                className={cn("relative inline-flex h-6 w-11 items-center rounded-full transition-colors", showSample ? "bg-primary" : "bg-muted")}
                role="switch"
                aria-checked={showSample}
              >
                <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform", showSample ? "translate-x-6" : "translate-x-1")} />
              </button>
            </div>
          </header>

          {/* Screen content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {activeScreen === 'dashboard' && <DashboardScreen showSample={showSample} onNavigate={handleNavigate} />}
            {activeScreen === 'calls' && <CallHistoryScreen showSample={showSample} />}
            {activeScreen === 'knowledge' && <KnowledgeBaseScreen />}
            {activeScreen === 'settings' && <SettingsScreen />}
          </div>
        </main>
      </div>
  )
}
