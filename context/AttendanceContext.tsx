"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Alert } from "react-native"
import { accelerometer } from "react-native-sensors"
import { map, filter } from "rxjs/operators"

// Types
export type ShiftType = "Morning" | "General" | "Afternoon" | "Night"
export type LeaveType = "Full" | "Half"
export type AttendanceStatus = "Present" | "Absent" | "Leave" | "CompOff" | "Holiday" | "WeeklyOff"

export interface AttendanceRecord {
  id: string
  date: string // ISO string
  checkInTime?: string
  checkOutTime?: string
  status: AttendanceStatus
  shift: ShiftType
  leaveType?: LeaveType
  workLog?: string
  isAutoDetected: boolean
}

export interface Holiday {
  id: string
  date: string // ISO string
  name: string
  isNational: boolean
}

export interface CompOffRecord {
  id: string
  earnedDate: string // ISO string
  reason: string
  usedDate?: string // ISO string
  status: "Available" | "Used"
}

export interface LeaveRecord {
  id: string
  startDate: string // ISO string
  endDate: string // ISO string
  type: LeaveType
  reason: string
  status: "Pending" | "Approved" | "Rejected"
}

interface AttendanceContextType {
  attendanceRecords: AttendanceRecord[]
  holidays: Holiday[]
  compOffRecords: CompOffRecord[]
  leaveRecords: LeaveRecord[]
  currentShift: ShiftType
  isMotionDetectionEnabled: boolean

  // Methods
  markAttendance: (status: AttendanceStatus, shift: ShiftType, isAuto?: boolean) => Promise<void>
  checkOut: () => Promise<void>
  addHoliday: (holiday: Omit<Holiday, "id">) => Promise<void>
  addCompOff: (compOff: Omit<CompOffRecord, "id">) => Promise<void>
  useCompOff: (id: string, date: string) => Promise<void>
  requestLeave: (leave: Omit<LeaveRecord, "id" | "status">) => Promise<void>
  addWorkLog: (date: string, log: string) => Promise<void>
  setCurrentShift: (shift: ShiftType) => void
  toggleMotionDetection: () => void
  exportData: (format: "PDF" | "Excel") => Promise<string>
  backupToGoogleDrive: () => Promise<void>
  restoreFromGoogleDrive: () => Promise<void>
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined)

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [compOffRecords, setCompOffRecords] = useState<CompOffRecord[]>([])
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>([])
  const [currentShift, setCurrentShift] = useState<ShiftType>("General")
  const [isMotionDetectionEnabled, setIsMotionDetectionEnabled] = useState(false)

  // Load data from AsyncStorage on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const attendanceData = await AsyncStorage.getItem("attendanceRecords")
        if (attendanceData) setAttendanceRecords(JSON.parse(attendanceData))

        const holidaysData = await AsyncStorage.getItem("holidays")
        if (holidaysData) setHolidays(JSON.parse(holidaysData))

        const compOffData = await AsyncStorage.getItem("compOffRecords")
        if (compOffData) setCompOffRecords(JSON.parse(compOffData))

        const leaveData = await AsyncStorage.getItem("leaveRecords")
        if (leaveData) setLeaveRecords(JSON.parse(leaveData))

        const shiftData = await AsyncStorage.getItem("currentShift")
        if (shiftData) setCurrentShift(JSON.parse(shiftData))

        const motionDetection = await AsyncStorage.getItem("isMotionDetectionEnabled")
        if (motionDetection) setIsMotionDetectionEnabled(JSON.parse(motionDetection))
      } catch (error) {
        Alert.alert("Error", "Failed to load data from storage")
      }
    }

    loadData()
  }, [])

  // Save data to AsyncStorage whenever it changes
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem("attendanceRecords", JSON.stringify(attendanceRecords))
        await AsyncStorage.setItem("holidays", JSON.stringify(holidays))
        await AsyncStorage.setItem("compOffRecords", JSON.stringify(compOffRecords))
        await AsyncStorage.setItem("leaveRecords", JSON.stringify(leaveRecords))
        await AsyncStorage.setItem("currentShift", JSON.stringify(currentShift))
        await AsyncStorage.setItem("isMotionDetectionEnabled", JSON.stringify(isMotionDetectionEnabled))
      } catch (error) {
        Alert.alert("Error", "Failed to save data to storage")
      }
    }

    saveData()
  }, [attendanceRecords, holidays, compOffRecords, leaveRecords, currentShift, isMotionDetectionEnabled])

  // Motion detection for automatic attendance
  useEffect(() => {
    let subscription: any

    if (isMotionDetectionEnabled) {
      subscription = accelerometer
        .pipe(
          map(({ x, y, z }) => Math.sqrt(x * x + y * y + z * z)),
          filter((acceleration) => acceleration > 15), // Threshold for significant movement
        )
        .subscribe(
          () => {
            // Auto mark attendance if significant movement is detected during work hours
            const now = new Date()
            const hour = now.getHours()

            // Determine shift based on time
            let detectedShift: ShiftType = "General"
            if (hour >= 6 && hour < 12) detectedShift = "Morning"
            else if (hour >= 12 && hour < 16) detectedShift = "General"
            else if (hour >= 16 && hour < 22) detectedShift = "Afternoon"
            else detectedShift = "Night"

            // Check if attendance already marked for today
            const today = now.toISOString().split("T")[0]
            const alreadyMarked = attendanceRecords.some((record) => record.date.split("T")[0] === today)

            if (!alreadyMarked) {
              markAttendance("Present", detectedShift, true)
            }
          },
          (error) => console.error("Error with accelerometer:", error),
        )
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [isMotionDetectionEnabled])

  // Mark attendance (check-in)
  const markAttendance = async (status: AttendanceStatus, shift: ShiftType, isAuto = false) => {
    try {
      const now = new Date()
      const today = now.toISOString()
      const todayStr = today.split("T")[0]

      // Check if attendance already marked for today
      const existingRecord = attendanceRecords.find((record) => record.date.split("T")[0] === todayStr)

      if (existingRecord) {
        // Update existing record
        const updatedRecords = attendanceRecords.map((record) =>
          record.id === existingRecord.id
            ? {
                ...record,
                status,
                shift,
                isAutoDetected: isAuto,
                // Only update check-in time if it doesn't exist
                checkInTime: record.checkInTime || now.toISOString(),
              }
            : record,
        )
        setAttendanceRecords(updatedRecords)
      } else {
        // Create new record
        const newRecord: AttendanceRecord = {
          id: Date.now().toString(),
          date: today,
          checkInTime: now.toISOString(),
          status,
          shift,
          isAutoDetected: isAuto,
        }
        setAttendanceRecords([...attendanceRecords, newRecord])
      }

      if (!isAuto) {
        Alert.alert("Success", "Attendance marked successfully")
      }
    } catch (error) {
      Alert.alert("Error", "Failed to mark attendance")
    }
  }

  // Check out
  const checkOut = async () => {
    try {
      const now = new Date()
      const todayStr = now.toISOString().split("T")[0]

      // Find today's record
      const existingRecord = attendanceRecords.find((record) => record.date.split("T")[0] === todayStr)

      if (existingRecord) {
        // Update check-out time
        const updatedRecords = attendanceRecords.map((record) =>
          record.id === existingRecord.id ? { ...record, checkOutTime: now.toISOString() } : record,
        )
        setAttendanceRecords(updatedRecords)
        Alert.alert("Success", "Check-out recorded successfully")
      } else {
        Alert.alert("Error", "No check-in record found for today")
      }
    } catch (error) {
      Alert.alert("Error", "Failed to record check-out")
    }
  }

  // Add holiday
  const addHoliday = async (holiday: Omit<Holiday, "id">) => {
    try {
      const newHoliday: Holiday = {
        ...holiday,
        id: Date.now().toString(),
      }
      setHolidays([...holidays, newHoliday])
      Alert.alert("Success", "Holiday added successfully")
    } catch (error) {
      Alert.alert("Error", "Failed to add holiday")
    }
  }

  // Add compensatory off
  const addCompOff = async (compOff: Omit<CompOffRecord, "id">) => {
    try {
      const newCompOff: CompOffRecord = {
        ...compOff,
        id: Date.now().toString(),
        status: "Available",
      }
      setCompOffRecords([...compOffRecords, newCompOff])
      Alert.alert("Success", "Compensatory off added successfully")
    } catch (error) {
      Alert.alert("Error", "Failed to add compensatory off")
    }
  }

  // Use compensatory off
  const useCompOff = async (id: string, date: string) => {
    try {
      // Update comp off record
      const updatedCompOffs = compOffRecords.map((record) =>
        record.id === id ? { ...record, usedDate: date, status: "Used" } : record,
      )
      setCompOffRecords(updatedCompOffs)

      // Add attendance record for comp off
      const now = new Date()
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        date,
        status: "CompOff",
        shift: currentShift,
        isAutoDetected: false,
      }
      setAttendanceRecords([...attendanceRecords, newRecord])

      Alert.alert("Success", "Compensatory off applied successfully")
    } catch (error) {
      Alert.alert("Error", "Failed to use compensatory off")
    }
  }

  // Request leave
  const requestLeave = async (leave: Omit<LeaveRecord, "id" | "status">) => {
    try {
      const newLeave: LeaveRecord = {
        ...leave,
        id: Date.now().toString(),
        status: "Approved", // Auto-approve since it's self-attendance
      }
      setLeaveRecords([...leaveRecords, newLeave])

      // Create attendance records for each day of leave
      const start = new Date(leave.startDate)
      const end = new Date(leave.endDate)
      const newAttendanceRecords: AttendanceRecord[] = []

      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString()
        newAttendanceRecords.push({
          id: `leave-${Date.now()}-${date.getTime()}`,
          date: dateStr,
          status: "Leave",
          shift: currentShift,
          leaveType: leave.type,
          isAutoDetected: false,
        })
      }

      setAttendanceRecords([...attendanceRecords, ...newAttendanceRecords])
      Alert.alert("Success", "Leave request submitted successfully")
    } catch (error) {
      Alert.alert("Error", "Failed to request leave")
    }
  }

  // Add work log
  const addWorkLog = async (date: string, log: string) => {
    try {
      const record = attendanceRecords.find((r) => r.date.split("T")[0] === date.split("T")[0])

      if (record) {
        const updatedRecords = attendanceRecords.map((r) => (r.id === record.id ? { ...r, workLog: log } : r))
        setAttendanceRecords(updatedRecords)
        Alert.alert("Success", "Work log added successfully")
      } else {
        Alert.alert("Error", "No attendance record found for this date")
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add work log")
    }
  }

  // Toggle motion detection
  const toggleMotionDetection = () => {
    setIsMotionDetectionEnabled((prev) => !prev)
  }

  // Export data (placeholder - would need actual PDF/Excel generation)
  const exportData = async (format: "PDF" | "Excel"): Promise<string> => {
    // This is a placeholder. In a real app, you would use libraries like
    // react-native-pdf or xlsx to generate actual files
    return new Promise((resolve) => {
      setTimeout(() => {
        Alert.alert("Export", `Data exported as ${format} successfully`)
        resolve(`/storage/emulated/0/Download/attendance_export.${format.toLowerCase()}`)
      }, 1000)
    })
  }

  // Google Drive backup (placeholder)
  const backupToGoogleDrive = async (): Promise<void> => {
    // This is a placeholder. In a real app, you would use Google Drive API
    return new Promise((resolve) => {
      setTimeout(() => {
        Alert.alert("Backup", "Data backed up to Google Drive successfully")
        resolve()
      }, 1000)
    })
  }

  // Google Drive restore (placeholder)
  const restoreFromGoogleDrive = async (): Promise<void> => {
    // This is a placeholder. In a real app, you would use Google Drive API
    return new Promise((resolve) => {
      setTimeout(() => {
        Alert.alert("Restore", "Data restored from Google Drive successfully")
        resolve()
      }, 1000)
    })
  }

  const value = {
    attendanceRecords,
    holidays,
    compOffRecords,
    leaveRecords,
    currentShift,
    isMotionDetectionEnabled,
    markAttendance,
    checkOut,
    addHoliday,
    addCompOff,
    useCompOff,
    requestLeave,
    addWorkLog,
    setCurrentShift,
    toggleMotionDetection,
    exportData,
    backupToGoogleDrive,
    restoreFromGoogleDrive,
  }

  return <AttendanceContext.Provider value={value}>{children}</AttendanceContext.Provider>
}

export const useAttendance = () => {
  const context = useContext(AttendanceContext)
  if (context === undefined) {
    throw new Error("useAttendance must be used within an AttendanceProvider")
  }
  return context
}

