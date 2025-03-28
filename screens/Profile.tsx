"use client"

import React, { useState } from "react"
import { View, StyleSheet, ScrollView } from "react-native"
import { Text, Card, Title, Button, Avatar, Divider, List, Portal, Dialog, TextInput } from "react-native-paper"
import { useAttendance } from "../context/AttendanceContext"
import { theme } from "../theme"
import { Mail, Phone, Building, Calendar, Clock } from "lucide-react-native"

export function Profile() {
  const { attendanceRecords, leaveRecords, compOffRecords } = useAttendance()

  const [profileDialogVisible, setProfileDialogVisible] = useState(false)
  const [name, setName] = useState("John Doe")
  const [email, setEmail] = useState("john.doe@example.com")
  const [phone, setPhone] = useState("(123) 456-7890")
  const [department, setDepartment] = useState("Engineering")
  const [designation, setDesignation] = useState("Software Engineer")

  // Calculate statistics
  const calculateStats = () => {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth()

    // Filter records for current year
    const thisYearRecords = attendanceRecords.filter((record) => {
      const recordDate = new Date(record.date)
      return recordDate.getFullYear() === currentYear
    })

    // Filter records for current month
    const thisMonthRecords = thisYearRecords.filter((record) => {
      const recordDate = new Date(record.date)
      return recordDate.getMonth() === currentMonth
    })

    // Count by status
    const countByStatus = (records, status) => {
      return records.filter((record) => record.status === status).length
    }

    // Available comp offs
    const availableCompOffs = compOffRecords.filter((record) => record.status === "Available").length

    // Used comp offs
    const usedCompOffs = compOffRecords.filter((record) => record.status === "Used").length

    // Available leaves (assuming 24 per year, adjust as needed)
    const totalLeaves = 24
    const usedLeaves = leaveRecords.length
    const availableLeaves = totalLeaves - usedLeaves

    return {
      presentDaysYear: countByStatus(thisYearRecords, "Present"),
      presentDaysMonth: countByStatus(thisMonthRecords, "Present"),
      leaveDaysYear: countByStatus(thisYearRecords, "Leave"),
      leaveDaysMonth: countByStatus(thisMonthRecords, "Leave"),
      availableCompOffs,
      usedCompOffs,
      availableLeaves,
      usedLeaves,
    }
  }

  const stats = calculateStats()

  // Handle profile update
  const handleProfileUpdate = () => {
    // In a real app, this would update the profile in storage
    setProfileDialogVisible(false)
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <Card style={styles.card}>
          <Card.Content style={styles.profileHeader}>
            <Avatar.Image size={80} source={{ uri: "https://i.pravatar.cc/300" }} style={styles.avatar} />
            <View style={styles.profileInfo}>
              <Title>{name}</Title>
              <Text>{designation}</Text>
              <Text>{department}</Text>
              <Button mode="text" onPress={() => setProfileDialogVisible(true)} style={styles.editButton}>
                Edit Profile
              </Button>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Contact Information</Title>
            <List.Item title="Email" description={email} left={() => <Mail size={24} color={theme.colors.primary} />} />
            <Divider />
            <List.Item
              title="Phone"
              description={phone}
              left={() => <Phone size={24} color={theme.colors.primary} />}
            />
            <Divider />
            <List.Item
              title="Department"
              description={department}
              left={() => <Building size={24} color={theme.colors.primary} />}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Attendance Statistics</Title>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.presentDaysYear}</Text>
                <Text style={styles.statLabel}>Present Days (Year)</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.presentDaysMonth}</Text>
                <Text style={styles.statLabel}>Present Days (Month)</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.leaveDaysYear}</Text>
                <Text style={styles.statLabel}>Leave Days (Year)</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.leaveDaysMonth}</Text>
                <Text style={styles.statLabel}>Leave Days (Month)</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Leave Balance</Title>
            <View style={styles.balanceContainer}>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceValue}>{stats.availableLeaves}</Text>
                <Text style={styles.balanceLabel}>Available Leaves</Text>
              </View>

              <View style={styles.balanceItem}>
                <Text style={styles.balanceValue}>{stats.usedLeaves}</Text>
                <Text style={styles.balanceLabel}>Used Leaves</Text>
              </View>

              <View style={styles.balanceItem}>
                <Text style={styles.balanceValue}>{stats.availableCompOffs}</Text>
                <Text style={styles.balanceLabel}>Available Comp Offs</Text>
              </View>

              <View style={styles.balanceItem}>
                <Text style={styles.balanceValue}>{stats.usedCompOffs}</Text>
                <Text style={styles.balanceLabel}>Used Comp Offs</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Recent Activity</Title>
            <List.Section>
              {attendanceRecords.slice(0, 5).map((record, index) => (
                <React.Fragment key={record.id}>
                  <List.Item
                    title={new Date(record.date).toLocaleDateString()}
                    description={`Status: ${record.status}, Shift: ${record.shift}`}
                    left={() =>
                      record.status === "Present" ? (
                        <Clock size={24} color={theme.colors.accent} />
                      ) : (
                        <Calendar size={24} color={theme.colors.primary} />
                      )
                    }
                  />
                  {index < 4 && <Divider />}
                </React.Fragment>
              ))}
            </List.Section>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Profile Edit Dialog */}
      <Portal>
        <Dialog visible={profileDialogVisible} onDismiss={() => setProfileDialogVisible(false)}>
          <Dialog.Title>Edit Profile</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Name" value={name} onChangeText={setName} mode="outlined" style={styles.textInput} />
            <TextInput label="Email" value={email} onChangeText={setEmail} mode="outlined" style={styles.textInput} />
            <TextInput label="Phone" value={phone} onChangeText={setPhone} mode="outlined" style={styles.textInput} />
            <TextInput
              label="Department"
              value={department}
              onChangeText={setDepartment}
              mode="outlined"
              style={styles.textInput}
            />
            <TextInput
              label="Designation"
              value={designation}
              onChangeText={setDesignation}
              mode="outlined"
              style={styles.textInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setProfileDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleProfileUpdate}>Save</Button>
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
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  editButton: {
    alignSelf: "flex-start",
    marginTop: 8,
    padding: 0,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  statLabel: {
    marginTop: 8,
    textAlign: "center",
  },
  balanceContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  balanceItem: {
    width: "48%",
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  balanceLabel: {
    marginTop: 8,
    textAlign: "center",
  },
  textInput: {
    marginBottom: 12,
  },
})

