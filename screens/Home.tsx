"use client"

import { useState, useEffect } from "react"
import { View, StyleSheet, ScrollView, Alert } from "react-native"
import {
  Text,
  Button,
  Card,
  Title,
  Paragraph,
  Chip,
  Divider,
  FAB,
  Portal,
  Dialog,
  RadioButton,
  TextInput,
} from "react-native-paper"
import { useAttendance, type ShiftType } from "../context/AttendanceContext"
import { Clock, Calendar, CheckCircle, XCircle, FileText, Coffee, Moon, Sun, Sunrise } from "lucide-react-native"
import { theme } from "../theme"

export function Home() {
  const {
    markAttendance,
    checkOut,
    attendanceRecords,
    currentShift,
    setCurrentShift,
    isMotionDetectionEnabled,
    toggleMotionDetection,
    addCompOff,
    addWorkLog,
  } = useAttendance()

  const [fabOpen, setFabOpen] = useState(false)
  const [shiftDialogVisible, setShiftDialogVisible] = useState(false)
  const [leaveDialogVisible, setLeaveDialogVisible] = useState(false)
  const [compOffDialogVisible, setCompOffDialogVisible] = useState(false)
  const [workLogDialogVisible, setWorkLogDialogVisible] = useState(false)
  const [selectedShift, setSelectedShift] = useState<ShiftType>(currentShift)
  const [workLog, setWorkLog] = useState("")
  const [compOffReason, setCompOffReason] = useState("")

  // Check if already checked in today
  const today = new Date().toISOString().split("T")[0]
  const todayRecord = attendanceRecords.find((record) => record.date.split("T")[0] === today)

  const isCheckedIn = !!todayRecord?.checkInTime
  const isCheckedOut = !!todayRecord?.checkOutTime

  // Get current date and time
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Format date and time
  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

  // Handle check in
  const handleCheckIn = () => {
    markAttendance("Present", currentShift)
  }

  // Handle check out
  const handleCheckOut = () => {
    checkOut()
  }

  // Handle shift change
  const handleShiftChange = () => {
    setCurrentShift(selectedShift)
    setShiftDialogVisible(false)
    Alert.alert("Success", `Shift changed to ${selectedShift}`)
  }

  // Handle comp off
  const handleCompOff = () => {
    if (!compOffReason.trim()) {
      Alert.alert("Error", "Please enter a reason for compensatory off")
      return
    }

    // Add comp off record
    addCompOff({
      earnedDate: new Date().toISOString(),
      reason: compOffReason,
      status: "Available",
    })

    setCompOffDialogVisible(false)
    setCompOffReason("")
  }

  // Handle work log
  const handleWorkLog = () => {
    if (!workLog.trim()) {
      Alert.alert("Error", "Please enter work log details")
      return
    }

    addWorkLog(new Date().toISOString(), workLog)

    setWorkLogDialogVisible(false)
    setWorkLog("")
  }

  // Get shift icon
  const getShiftIcon = () => {
    switch (currentShift) {
      case "Morning":
        return <Sunrise size={24} color={theme.colors.primary} />
      case "General":
        return <Sun size={24} color={theme.colors.primary} />
      case "Afternoon":
        return <Sun size={24} color={theme.colors.primary} />
      case "Night":
        return <Moon size={24} color={theme.colors.primary} />
      default:
        return <Sun size={24} color={theme.colors.primary} />
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Employee Self-Attendance</Title>
            <View style={styles.dateTimeContainer}>
              <View style={styles.dateContainer}>
                <Calendar size={20} color={theme.colors.primary} />
                <Text style={styles.date}>{formattedDate}</Text>
              </View>
              <View style={styles.timeContainer}>
                <Clock size={20} color={theme.colors.primary} />
                <Text style={styles.time}>{formattedTime}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.statusContainer}>
              <View style={styles.statusItem}>
                <Title>Status</Title>
                <Chip
                  icon={() =>
                    isCheckedIn ? (
                      <CheckCircle size={18} color={theme.colors.accent} />
                    ) : (
                      <XCircle size={18} color={theme.colors.error} />
                    )
                  }
                  style={{
                    backgroundColor: isCheckedIn ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                  }}
                >
                  {isCheckedIn ? "Checked In" : "Not Checked In"}
                </Chip>
              </View>

              <View style={styles.statusItem}>
                <Title>Current Shift</Title>
                <Chip
                  icon={() => getShiftIcon()}
                  onPress={() => setShiftDialogVisible(true)}
                  style={{
                    backgroundColor: "rgba(79, 70, 229, 0.1)",
                  }}
                >
                  {currentShift}
                </Chip>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={handleCheckIn}
                disabled={isCheckedIn}
                style={[styles.button, isCheckedIn && styles.disabledButton]}
                icon={() => <CheckCircle size={18} color="white" />}
              >
                Check In
              </Button>

              <Button
                mode="contained"
                onPress={handleCheckOut}
                disabled={!isCheckedIn || isCheckedOut}
                style={[styles.button, (!isCheckedIn || isCheckedOut) && styles.disabledButton]}
                icon={() => <XCircle size={18} color="white" />}
              >
                Check Out
              </Button>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title>Quick Actions</Title>
            <View style={styles.quickActions}>
              <Button
                mode="outlined"
                onPress={() => setLeaveDialogVisible(true)}
                style={styles.quickActionButton}
                icon={() => <Calendar size={18} color={theme.colors.primary} />}
              >
                Apply Leave
              </Button>

              <Button
                mode="outlined"
                onPress={() => setCompOffDialogVisible(true)}
                style={styles.quickActionButton}
                icon={() => <Coffee size={18} color={theme.colors.primary} />}
              >
                Comp Off
              </Button>

              <Button
                mode="outlined"
                onPress={() => setWorkLogDialogVisible(true)}
                style={styles.quickActionButton}
                icon={() => <FileText size={18} color={theme.colors.primary} />}
              >
                Work Log
              </Button>

              <Button
                mode="outlined"
                onPress={toggleMotionDetection}
                style={styles.quickActionButton}
                icon={() =>
                  isMotionDetectionEnabled ? (
                    <CheckCircle size={18} color={theme.colors.accent} />
                  ) : (
                    <XCircle size={18} color={theme.colors.error} />
                  )
                }
              >
                {isMotionDetectionEnabled ? "Auto: ON" : "Auto: OFF"}
              </Button>
            </View>
          </Card.Content>
        </Card>

        {todayRecord && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Today's Record</Title>
              <View style={styles.recordItem}>
                <Text style={styles.recordLabel}>Status:</Text>
                <Text style={styles.recordValue}>{todayRecord.status}</Text>
              </View>

              <View style={styles.recordItem}>
                <Text style={styles.recordLabel}>Shift:</Text>
                <Text style={styles.recordValue}>{todayRecord.shift}</Text>
              </View>

              {todayRecord.checkInTime && (
                <View style={styles.recordItem}>
                  <Text style={styles.recordLabel}>Check In:</Text>
                  <Text style={styles.recordValue}>{new Date(todayRecord.checkInTime).toLocaleTimeString()}</Text>
                </View>
              )}

              {todayRecord.checkOutTime && (
                <View style={styles.recordItem}>
                  <Text style={styles.recordLabel}>Check Out:</Text>
                  <Text style={styles.recordValue}>{new Date(todayRecord.checkOutTime).toLocaleTimeString()}</Text>
                </View>
              )}

              {todayRecord.workLog && (
                <View style={styles.recordItem}>
                  <Text style={styles.recordLabel}>Work Log:</Text>
                  <Text style={styles.recordValue}>{todayRecord.workLog}</Text>
                </View>
              )}

              <View style={styles.recordItem}>
                <Text style={styles.recordLabel}>Detection:</Text>
                <Text style={styles.recordValue}>{todayRecord.isAutoDetected ? "Automatic" : "Manual"}</Text>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* FAB */}
      <Portal>
        <FAB.Group
          open={fabOpen}
          icon={fabOpen ? "close" : "plus"}
          actions={[
            {
              icon: "calendar",
              label: "Apply Leave",
              onPress: () => setLeaveDialogVisible(true),
            },
            {
              icon: "coffee",
              label: "Comp Off",
              onPress: () => setCompOffDialogVisible(true),
            },
            {
              icon: "file-document",
              label: "Work Log",
              onPress: () => setWorkLogDialogVisible(true),
            },
          ]}
          onStateChange={({ open }) => setFabOpen(open)}
          style={styles.fab}
        />
      </Portal>

      {/* Shift Dialog */}
      <Portal>
        <Dialog visible={shiftDialogVisible} onDismiss={() => setShiftDialogVisible(false)}>
          <Dialog.Title>Select Shift</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={(value) => setSelectedShift(value as ShiftType)} value={selectedShift}>
              <RadioButton.Item label="Morning" value="Morning" />
              <RadioButton.Item label="General" value="General" />
              <RadioButton.Item label="Afternoon" value="Afternoon" />
              <RadioButton.Item label="Night" value="Night" />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShiftDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleShiftChange}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Leave Dialog */}
      <Portal>
        <Dialog visible={leaveDialogVisible} onDismiss={() => setLeaveDialogVisible(false)}>
          <Dialog.Title>Apply Leave</Dialog.Title>
          <Dialog.Content>
            <Paragraph>This will open the leave application form.</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLeaveDialogVisible(false)}>Cancel</Button>
            <Button
              onPress={() => {
                setLeaveDialogVisible(false)
                // Navigate to leave form (would be implemented in a real app)
                Alert.alert("Navigation", "Navigating to leave form")
              }}
            >
              Continue
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Comp Off Dialog */}
      <Portal>
        <Dialog visible={compOffDialogVisible} onDismiss={() => setCompOffDialogVisible(false)}>
          <Dialog.Title>Compensatory Off</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Reason for Comp Off"
              value={compOffReason}
              onChangeText={setCompOffReason}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.textInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCompOffDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleCompOff}>Submit</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Work Log Dialog */}
      <Portal>
        <Dialog visible={workLogDialogVisible} onDismiss={() => setWorkLogDialogVisible(false)}>
          <Dialog.Title>Add Work Log</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Work Log Details"
              value={workLog}
              onChangeText={setWorkLog}
              mode="outlined"
              multiline
              numberOfLines={5}
              style={styles.textInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setWorkLogDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleWorkLog}>Submit</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  dateTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  date: {
    marginLeft: 8,
    fontSize: 14,
  },
  time: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "bold",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statusItem: {
    alignItems: "center",
  },
  divider: {
    marginVertical: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  button: {
    width: "45%",
  },
  disabledButton: {
    opacity: 0.6,
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 8,
  },
  quickActionButton: {
    marginBottom: 8,
    width: "48%",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
  recordItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  recordLabel: {
    fontWeight: "bold",
    width: 100,
  },
  recordValue: {
    flex: 1,
  },
  textInput: {
    marginTop: 8,
  },
})

