import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [isEditClicked, setIsEditClicked] = useState(false);
  const [editTask, setEditTask] = useState();

  // Load tasks from AsyncStorage when the app starts
  useEffect(() => {
    loadTasks();
  }, []);

  // Save tasks to AsyncStorage whenever they change
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // Save tasks to AsyncStorage
  const saveTasks = async (tasksToSave) => {
    try {
      const jsonValue = JSON.stringify(tasksToSave);
      await AsyncStorage.setItem('@sampleToDoTasks', jsonValue);
    } catch (e) {
      console.error('Error saving tasks to AsyncStorage:', e);
    }
  };

  // Load tasks from AsyncStorage
  const loadTasks = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@sampleToDoTasks');
      if (jsonValue != null) {
        setTasks(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error('Error loading tasks from AsyncStorage:', e);
    }
  };

  // Add a new task with animation
  const addTask = () => {
    if (task.trim()) {
      const animationValue = new Animated.Value(0); // Initialize animation value
      const newTask = {
        id: Date.now().toString(),
        text: task,
        status: false,
        animationValue, // Attach animation value to task
      };
      setTasks([...tasks, newTask]);
      // Animate opacity to fade in the new task
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      setTask('');
    }
  };

  // Delete task
  const deleteTask = (taskId) => {
    setTasks((prevTasks) => prevTasks.filter((item) => item.id !== taskId));
  };

  // Mark task as completed
  const markAsCompleted = (taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: true } : task
      )
    );
  };

  // Edit task
  const editTaskFun = (taskId) => {
    const tempTask = tasks.find((item) => item.id === taskId);
    if (tempTask) {
      setEditTask(tempTask);
      setTask(tempTask.text);
      setIsEditClicked(true);
    } else {
      Alert.alert(`Task doesn't exist`);
    }
  };

  // Save edited task
  const editDone = () => {
    if (editTask) {
      if (task.trim()) {
        setTasks((prevTasks) =>
          prevTasks.map((tsk) =>
            tsk.id === editTask.id ? { ...tsk, text: task } : tsk
          )
        );
        setTask('');
      }
    } else {
      Alert.alert(`Task doesn't exist`);
    }
    setIsEditClicked(false);
  };

  // Clear completed tasks
  const clearCompletedTasks = () => {
    setTasks((prevTasks) => prevTasks.filter((task) => !task.status));
  };

  return (
    <View style={styles.container}>
      {isEditClicked ? (
        <>
          <Text>Edit your task here</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={`${task}`}
              value={task}
              onChangeText={(text) => setTask(text)}
            />
            <TouchableOpacity style={styles.doneButton} onPress={editDone}>
              <Text style={styles.done}>Done</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.title}>Simple To-Do List</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Add a new task"
              value={task}
              onChangeText={(text) => setTask(text)}
            />
            <TouchableOpacity style={styles.addButton} onPress={addTask}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={tasks}
            renderItem={({ item }) => (
              <Animated.View
                style={[styles.taskContainer, { opacity: item.animationValue || 1 }]}
              >
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => editTaskFun(item.id)}
                >
                  <Text
                    style={[
                      styles.taskText,
                      { textDecorationLine: item.status ? 'line-through' : 'none' },
                    ]}
                  >
                    {item.text}
                  </Text>
                </TouchableOpacity>
                {!item.status && (
                  <View style={styles.tools}>
                    <TouchableOpacity onPress={() => markAsCompleted(item.id)}>
                      <Text style={styles.editbutton}>Done</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteTask(item.id)}>
                      <Text style={styles.deleteButton}>X</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Animated.View>
            )}
            keyExtractor={(item) => item.id}
          />
          <TouchableOpacity
            style={styles.clearCompletedButton}
            onPress={clearCompletedTasks}
          >
            <Text style={styles.clearCompletedButtonText}>Clear Completed</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}