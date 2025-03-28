"use client"

import { useState } from "react"
import { View, StyleSheet, ScrollView } from "react-native"
import { Text, Card, Title, Paragraph, Button, Chip, Portal, Dialog, TextInput } from "react-native-paper"
import { Calendar as CalendarComponent } from "react-native-calendars"
import { useAttendance, type AttendanceStatus } from "../context/AttendanceContext"
import { theme } from "../theme"

export function Calendar() {
  const { attendanceRecords, holidays, addHoliday } = useAttendance()

  const [selectedDate, setSelectedDate] = useState("")
  const [holidayDialogVisible, setHolidayDialogVisible] = useState(false)
  const [holidayName, setHolidayName] = useState("")
  const [isNationalHoliday, setIsNationalHoliday] = useState(true)

  // Format dates for calendar marking
  const getMarkedDates = () => {
    const markedDates = {}

    // Mark attendance records
    attendanceRecords.forEach((record) => {
      const dateStr = record.date.split("T")[0]
      let color

      switch (record.status) {
        case "Present":
          color = theme.colors.accent
          break
        case "Absent":
          color = theme.colors.error
          break
        case "Leave":
          color = "#FFA500" // Orange
          break
        case "CompOff":
          color = "#9C27B0" // Purple
          break
        case "Holiday":
          color = "#3F51B5" // Indigo
          break
        case "WeeklyOff":
          color = "#607D8B" // Blue Gray
          break
        default:
          color = theme.colors.primary
      }

      markedDates[dateStr] = {
        marked: true,
        dotColor: color,
        selected: dateStr === selectedDate,
        selectedColor: dateStr === selectedDate ? "rgba(79, 70, 229, 0.2)" : undefined,
      }
    })

    // Mark holidays
    holidays.forEach((holiday) => {
      const dateStr = holiday.date.split("T")[0]
      markedDates[dateStr] = {
        ...markedDates[dateStr],
        marked: true,
        dotColor: holiday.isNational ? "#3F51B5" : "#607D8B", // Indigo for national, Blue Gray for custom
        selected: dateStr === selectedDate,
        selectedColor: dateStr === selectedDate ? "rgba(79, 70, 229, 0.2)" : undefined,
      }
    })

    // Mark selected date if not already marked
    if (selectedDate && !markedDates[selectedDate]) {
      markedDates[selectedDate] = {
        selected: true,
        selectedColor: "rgba(79, 70, 229, 0.2)",
      }
    }

    return markedDates
  }

  // Get record for selected date
  const getSelectedDateRecord = () => {
    return attendanceRecords.find((record) => record.date.split("T")[0] === selectedDate)
  }

  // Get holiday for selected date
  const getSelectedDateHoliday = () => {
    return holidays.find((holiday) => holiday.date.split("T")[0] === selectedDate)
  }

  // Handle adding holiday
  const handleAddHoliday = () => {
    if (!holidayName.trim()) {
      return
    }

    addHoliday({
      date: selectedDate,
      name: holidayName,
      isNational: isNationalHoliday,
    })

    setHolidayDialogVisible(false)
    setHolidayName("")
    setIsNationalHoliday(true)
  }

  // Get status color
  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case "Present":
        return theme.colors.accent
      case "Absent":
        return theme.colors.error
      case "Leave":
        return "#FFA500" // Orange
      case "CompOff":
        return "#9C27B0" // Purple
      case "Holiday":
        return "#3F51B5" // Indigo
      case "WeeklyOff":
        return "#607D8B" // Blue Gray
      default:
        return theme.colors.primary
    }
  }

  const selectedRecord = getSelectedDateRecord()
  const selectedHoliday = getSelectedDateHoliday()

  return (
    <View style={styles.container}>
      <ScrollView>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Attendance Calendar</Title>
            <CalendarComponent
              markedDates={getMarkedDates()}
              onDayPress={(day) => setSelectedDate(day.dateString)}
              theme={{
                todayTextColor: theme.colors.primary,
                arrowColor: theme.colors.primary,
                dotColor: theme.colors.primary,
                selectedDayBackgroundColor: theme.colors.primary,
              }}
            />
          </Card.Content>
        </Card>

        {selectedDate && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>
                {new Date(selectedDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Title>

              {selectedRecord ? (
                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <Chip style={{ backgroundColor: `${getStatusColor(selectedRecord.status)}20` }}>
                      {selectedRecord.status}
                    </Chip>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Shift:</Text>
                    <Text>{selectedRecord.shift}</Text>
                  </View>

                  {selectedRecord.checkInTime && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Check In:</Text>
                      <Text>{new Date(selectedRecord.checkInTime).toLocaleTimeString()}</Text>
                    </View>
                  )}

                  {selectedRecord.checkOutTime && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Check Out:</Text>
                      <Text>{new Date(selectedRecord.checkOutTime).toLocaleTimeString()}</Text>
                    </View>
                  )}

                  {selectedRecord.leaveType && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Leave Type:</Text>
                      <Text>{selectedRecord.leaveType}</Text>
                    </View>
                  )}

                  {selectedRecord.workLog && (
                    <View style={styles.workLog}>
                      <Text style={styles.detailLabel}>Work Log:</Text>
                      <Paragraph>{selectedRecord.workLog}</Paragraph>
                    </View>
                  )}
                </View>
              ) : selectedHoliday ? (
                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Holiday:</Text>
                    <Chip
                      style={{
                        backgroundColor: selectedHoliday.isNational
                          ? "rgba(63, 81, 181, 0.2)"
                          : "rgba(96, 125, 139, 0.2)",
                      }}
                    >
                      {selectedHoliday.name}
                    </Chip>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Type:</Text>
                    <Text>{selectedHoliday.isNational ? "National Holiday" : "Custom Holiday"}</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.noRecordContainer}>
                  <Paragraph>No record for this date.</Paragraph>
                  <Button mode="outlined" onPress={() => setHolidayDialogVisible(true)} style={styles.addButton}>
                    Add as Holiday
                  </Button>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <Title>Legend</Title>
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.colors.accent }]} />
                <Text>Present</Text>
              </View>

              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.colors.error }]} />
                <Text>Absent</Text>
              </View>

              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#FFA500" }]} />
                <Text>Leave</Text>
              </View>

              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#9C27B0" }]} />
                <Text>Comp Off</Text>
              </View>

              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#3F51B5" }]} />
                <Text>Holiday</Text>
              </View>

              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#607D8B" }]} />
                <Text>Weekly Off</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Holiday Dialog */}
      <Portal>
        <Dialog visible={holidayDialogVisible} onDismiss={() => setHolidayDialogVisible(false)}>
          <Dialog.Title>Add Holiday</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Holiday Name"
              value={holidayName}
              onChangeText={setHolidayName}
              mode="outlined"
              style={styles.textInput}
            />
            <View style={styles.radioContainer}>
              <Text>Holiday Type:</Text>
              <View style={styles.radioOption}>
                <Button
                  mode={isNationalHoliday ? "contained" : "outlined"}
                  onPress={() => setIsNationalHoliday(true)}
                  style={styles.radioButton}
                >
                  National
                </Button>
                <Button
                  mode={!isNationalHoliday ? "contained" : "outlined"}
                  onPress={() => setIsNationalHoliday(false)}
                  style={styles.radioButton}
                >
                  Custom
                </Button>
              </View>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setHolidayDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleAddHoliday}>Add</Button>
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
  detailsContainer: {
    marginTop: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: "bold",
    width: 100,
  },
  workLog: {
    marginTop: 8,
  },
  noRecordContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  addButton: {
    marginTop: 8,
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  textInput: {
    marginBottom: 16,
  },
  radioContainer: {
    marginTop: 8,
  },
  radioOption: {
    flexDirection: "row",
    marginTop: 8,
  },
  radioButton: {
    marginRight: 8,
  },
})

