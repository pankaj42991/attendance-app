"use client"

import { useState } from "react"
import { View, StyleSheet, ScrollView, Alert, Linking } from "react-native"
import { Text, Card, Title, Switch, Button, List, Divider, Portal, Dialog, RadioButton } from "react-native-paper"
import { useAttendance, type ShiftType } from "../context/AttendanceContext"
import { theme } from "../theme"
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  FileText,
  Moon,
  Sun,
  Sunrise,
  Clock,
  Bell,
  Trash,
} from "lucide-react-native"

export function Settings() {
  const {
    currentShift,
    setCurrentShift,
    isMotionDetectionEnabled,
    toggleMotionDetection,
    exportData,
    backupToGoogleDrive,
    restoreFromGoogleDrive,
  } = useAttendance()

  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [exportDialogVisible, setExportDialogVisible] = useState(false)
  const [exportFormat, setExportFormat] = useState<"PDF" | "Excel">("PDF")
  const [shiftDialogVisible, setShiftDialogVisible] = useState(false)
  const [selectedShift, setSelectedShift] = useState<ShiftType>(currentShift)
  const [confirmResetVisible, setConfirmResetVisible] = useState(false)

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    // In a real app, this would update the app theme
  }

  // Toggle notifications
  const toggleNotifications = () => {
    setNotifications(!notifications)
    // In a real app, this would update notification settings
  }

  // Handle export
  const handleExport = async () => {
    try {
      const filePath = await exportData(exportFormat)
      setExportDialogVisible(false)
      Alert.alert("Export Successful", `Data exported as ${exportFormat} to ${filePath}`, [
        { text: "OK" },
        {
          text: "Open File",
          onPress: () => {
            // In a real app, this would open the file
            Alert.alert("Open File", `Opening ${filePath}`)
          },
        },
      ])
    } catch (error) {
      Alert.alert("Export Failed", "Failed to export data")
    }
  }

  // Handle backup
  const handleBackup = async () => {
    try {
      await backupToGoogleDrive()
    } catch (error) {
      Alert.alert("Backup Failed", "Failed to backup data to Google Drive")
    }
  }

  // Handle restore
  const handleRestore = async () => {
    try {
      await restoreFromGoogleDrive()
    } catch (error) {
      Alert.alert("Restore Failed", "Failed to restore data from Google Drive")
    }
  }

  // Handle shift change
  const handleShiftChange = () => {
    setCurrentShift(selectedShift)
    setShiftDialogVisible(false)
    Alert.alert("Success", `Default shift changed to ${selectedShift}`)
  }

  // Handle reset
  const handleReset = () => {
    // In a real app, this would reset all data
    Alert.alert("Reset Successful", "All data has been reset")
    setConfirmResetVisible(false)
  }

  // Get shift icon
  const getShiftIcon = (shift: ShiftType) => {
    switch (shift) {
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
            <Title style={styles.title}>App Settings</Title>
            <List.Section>
              <List.Item
                title="Dark Mode"
                description="Enable dark theme"
                left={() => <Moon size={24} color={theme.colors.primary} />}
                right={() => <Switch value={darkMode} onValueChange={toggleDarkMode} color={theme.colors.primary} />}
              />
              <Divider />
              <List.Item
                title="Notifications"
                description="Enable push notifications"
                left={() => <Bell size={24} color={theme.colors.primary} />}
                right={() => (
                  <Switch value={notifications} onValueChange={toggleNotifications} color={theme.colors.primary} />
                )}
              />
              <Divider />
              <List.Item
                title="Automatic Attendance"
                description="Detect attendance using motion sensors"
                left={() => <Clock size={24} color={theme.colors.primary} />}
                right={() => (
                  <Switch
                    value={isMotionDetectionEnabled}
                    onValueChange={toggleMotionDetection}
                    color={theme.colors.primary}
                  />
                )}
              />
              <Divider />
              <List.Item
                title="Default Shift"
                description={`Current: ${currentShift}`}
                left={() => getShiftIcon(currentShift)}
                onPress={() => setShiftDialogVisible(true)}
              />
            </List.Section>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Data Management</Title>
            <List.Section>
              <List.Item
                title="Export Data"
                description="Export as PDF or Excel"
                left={() => <Download size={24} color={theme.colors.primary} />}
                onPress={() => setExportDialogVisible(true)}
              />
              <Divider />
              <List.Item
                title="Backup to Google Drive"
                description="Save your data to the cloud"
                left={() => <Upload size={24} color={theme.colors.primary} />}
                onPress={handleBackup}
              />
              <Divider />
              <List.Item
                title="Restore from Google Drive"
                description="Restore your data from the cloud"
                left={() => <Download size={24} color={theme.colors.primary} />}
                onPress={handleRestore}
              />
              <Divider />
              <List.Item
                title="Reset All Data"
                description="Delete all attendance records"
                left={() => <Trash size={24} color={theme.colors.error} />}
                onPress={() => setConfirmResetVisible(true)}
              />
            </List.Section>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>About</Title>
            <List.Section>
              <List.Item
                title="Version"
                description="1.0.0"
                left={() => <SettingsIcon size={24} color={theme.colors.primary} />}
              />
              <Divider />
              <List.Item
                title="Help & Support"
                description="Get help with the app"
                left={() => <FileText size={24} color={theme.colors.primary} />}
                onPress={() => {
                  // In a real app, this would open a help page
                  Alert.alert("Help", "Opening help page")
                }}
              />
              <Divider />
              <List.Item
                title="Privacy Policy"
                description="Read our privacy policy"
                left={() => <FileText size={24} color={theme.colors.primary} />}
                onPress={() => {
                  // In a real app, this would open the privacy policy
                  Linking.openURL("https://example.com/privacy")
                }}
              />
              <Divider />
              <List.Item
                title="Terms of Service"
                description="Read our terms of service"
                left={() => <FileText size={24} color={theme.colors.primary} />}
                onPress={() => {
                  // In a real app, this would open the terms of service
                  Linking.openURL("https://example.com/terms")
                }}
              />
            </List.Section>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Export Dialog */}
      <Portal>
        <Dialog visible={exportDialogVisible} onDismiss={() => setExportDialogVisible(false)}>
          <Dialog.Title>Export Data</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={(value) => setExportFormat(value as "PDF" | "Excel")}
              value={exportFormat}
            >
              <RadioButton.Item label="PDF" value="PDF" />
              <RadioButton.Item label="Excel" value="Excel" />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setExportDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleExport}>Export</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Shift Dialog */}
      <Portal>
        <Dialog visible={shiftDialogVisible} onDismiss={() => setShiftDialogVisible(false)}>
          <Dialog.Title>Select Default Shift</Dialog.Title>
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

      {/* Reset Confirmation Dialog */}
      <Portal>
        <Dialog visible={confirmResetVisible} onDismiss={() => setConfirmResetVisible(false)}>
          <Dialog.Title>Reset All Data</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to reset all data? This action cannot be undone.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmResetVisible(false)}>Cancel</Button>
            <Button onPress={handleReset} color={theme.colors.error}>
              Reset
            </Button>
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
})

