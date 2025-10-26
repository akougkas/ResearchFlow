# Phase 2 Testing Checklist

## 🧪 Manual Testing Instructions

Open http://localhost:8001 in your browser and perform these tests:

### 1. Template System Test
**Steps:**
1. Click "⚡ Load Template" button
2. Select "📝 Paper Submission (18 tasks)"
3. Wait for notification "✅ Created 18 tasks from Paper Submission template!"

**Expected:**
- 18 tasks created
- Tasks have dependencies (some tasks reference others)
- Due dates are calculated from today
- No circular dependency errors

**Verification:**
```javascript
// Open browser console (F12) and run:
const tasks = window.app.taskStore.getAll();
console.log(`Total tasks: ${tasks.length}`);
const withDeps = tasks.filter(t => t.dependencies && t.dependencies.length > 0);
console.log(`Tasks with dependencies: ${withDeps.length}`);
```

---

### 2. Circular Dependency Validation Test
**Steps:**
1. Create Task A manually
2. Create Task B with dependency on A
3. Try to update Task A to depend on B (should fail)

**Expected:**
- Error message: "Circular dependency detected"
- Task A's dependencies remain unchanged

**Verification:**
```javascript
// Run in console:
const taskA = window.app.taskStore.create({ text: 'Task A', category: 'data' });
const taskB = window.app.taskStore.create({ text: 'Task B', category: 'data', dependencies: [taskA.id] });

try {
  window.app.taskStore.update(taskA.id, { dependencies: [taskB.id] });
  console.error('❌ FAILED: Should have blocked circular dependency');
} catch (error) {
  console.log('✅ PASSED:', error.message);
}

// Cleanup
window.app.taskStore.delete(taskA.id);
window.app.taskStore.delete(taskB.id);
```

---

### 3. Kanban View Test
**Steps:**
1. Create 3-5 tasks
2. Click "📊 Kanban" button
3. Drag a task from "Todo" to "In Progress"
4. Drag a task to "Done"

**Expected:**
- Kanban board displays 4 columns
- Tasks appear in correct columns
- Drag and drop works smoothly
- Task status updates when dropped
- Completed tasks move to "Done" column

**Verification:**
- Check task status in console: `window.app.taskStore.getAll()[0].status`
- Should be 'in-progress' or 'review' after dragging

---

### 4. Timeline View Test
**Steps:**
1. Create tasks with different due dates
2. Click "📅 Timeline" button
3. Click "Next →" to navigate months
4. Select "Week View" from dropdown

**Expected:**
- Calendar displays current month
- Tasks appear on their due dates
- Navigation works (Prev/Next)
- Week view shows 7 days
- Today is highlighted

**Verification:**
- Timeline should show tasks with due dates
- Tasks without due dates don't appear

---

### 5. Advanced Filter Test
**Steps:**
1. Scroll down to see Filter Panel (if visible)
2. Check "🧪 Experiments" category
3. Check "🔥 Critical" priority
4. Select date range
5. Click "Reset All"

**Expected:**
- Filters apply in real-time
- Multiple filters combine (AND logic)
- Active filters display at bottom
- Reset clears all filters
- All views (List/Kanban/Timeline) respect filters

**Verification:**
```javascript
// Check if filter is working:
const advFilter = window.app.advancedFilter;
console.log('Current filters:', advFilter.getFilters());
```

---

### 6. Project Manager Test
**Steps:**
1. Look for "📁 Projects" section in left sidebar
2. Click "+ New Project"
3. Enter project name
4. View project list

**Expected:**
- Projects appear in sidebar
- Each project shows task count
- Completion percentage displayed

**Verification:**
```javascript
const projects = window.app.projectManager.getAll();
console.log('Projects:', projects);
```

---

### 7. Blocked Task Detection Test
**Steps:**
1. Create Task A
2. Create Task B with dependency on Task A
3. Try to complete Task B (should be blocked)
4. Complete Task A
5. Now complete Task B (should work)

**Expected:**
- Task B shows blocked indicator when A is incomplete
- Task B becomes unblocked after A is completed

**Verification:**
```javascript
const taskA = window.app.taskStore.create({ text: 'Blocking', category: 'data' });
const taskB = window.app.taskStore.create({ text: 'Blocked', category: 'data', dependencies: [taskA.id] });

console.log('Task B can complete?', window.app.taskStore.canComplete(taskB.id)); // Should be false

window.app.taskStore.toggleComplete(taskA.id);
console.log('Task B can complete now?', window.app.taskStore.canComplete(taskB.id)); // Should be true

// Cleanup
window.app.taskStore.delete(taskA.id);
window.app.taskStore.delete(taskB.id);
```

---

### 8. Keyboard Shortcuts Test
**Steps:**
1. Press `Ctrl+K` (focus task input)
2. Press `Ctrl+1` (switch to List view)
3. Press `Ctrl+2` (switch to Kanban view)
4. Press `Ctrl+3` (switch to Timeline view)

**Expected:**
- All shortcuts work
- View switches smoothly
- No errors in console

---

## 🐛 Known Issues

### Fixed:
- ✅ Template menu toggle initialization
- ✅ TimelineView select element not initialized
- ✅ AdvancedFilter not integrated with views
- ✅ Template menu positioning

### Potential Minor Issues:
- Filter panel may need visibility toggle
- Template menu click-outside listener could conflict with multiple instances
- Project stats might not update in real-time when tasks change

---

## 📝 Bug Report Template

If you find a bug, report it like this:

**Bug:** [Short description]
**Steps to Reproduce:** 
1. ...
2. ...

**Expected:** [What should happen]
**Actual:** [What actually happens]
**Console Errors:** [Any errors from F12 console]

---

## ✅ Sign-Off Checklist

- [ ] All templates load without errors
- [ ] Circular dependencies are blocked
- [ ] Kanban drag-and-drop works
- [ ] Timeline navigation works
- [ ] Advanced filters apply correctly
- [ ] Projects can be created
- [ ] Blocked tasks are detected
- [ ] All keyboard shortcuts work
- [ ] No console errors during normal usage

