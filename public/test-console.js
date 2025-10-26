/**
 * Phase 2 Quick Test Script
 * Open http://localhost:8001, press F12, and paste this entire file
 */

console.log('%c🧪 ResearchFlow Phase 2 Quick Test', 'font-size: 20px; font-weight: bold; color: #3b82f6');
console.log('Running automated tests...\n');

async function runTests() {
  const tests = [];
  
  // Test 1: Circular Dependency
  console.log('%c1️⃣ Testing Circular Dependency Detection...', 'font-weight: bold');
  try {
    const t1 = window.app.taskStore.create({ text: 'Test A', category: 'data' });
    const t2 = window.app.taskStore.create({ text: 'Test B', category: 'data', dependencies: [t1.id] });
    
    try {
      window.app.taskStore.update(t1.id, { dependencies: [t2.id] });
      console.log('   ❌ FAILED: Should have blocked circular dependency');
      tests.push(false);
    } catch (error) {
      console.log('   ✅ PASSED: Circular dependency blocked');
      tests.push(true);
    }
    
    window.app.taskStore.delete(t1.id);
    window.app.taskStore.delete(t2.id);
  } catch (error) {
    console.log('   ❌ ERROR:', error.message);
    tests.push(false);
  }

  // Test 2: Template Loading
  console.log('\n%c2️⃣ Testing Template Generation...', 'font-weight: bold');
  try {
    const before = window.app.taskStore.getAll().length;
    window.app.loadTemplate('paper');
    
    setTimeout(() => {
      const after = window.app.taskStore.getAll().length;
      const created = after - before;
      
      if (created === 18) {
        console.log(`   ✅ PASSED: Created ${created} tasks`);
        
        const recentTasks = window.app.taskStore.getAll().slice(-18);
        const withDeps = recentTasks.filter(t => t.dependencies && t.dependencies.length > 0);
        console.log(`   ✅ ${withDeps.length} tasks have dependencies`);
        tests.push(true);
      } else {
        console.log(`   ❌ FAILED: Expected 18 tasks, got ${created}`);
        tests.push(false);
      }
    }, 200);
  } catch (error) {
    console.log('   ❌ ERROR:', error.message);
    tests.push(false);
  }

  // Test 3: View Switching
  console.log('\n%c3️⃣ Testing View Switching...', 'font-weight: bold');
  try {
    window.app.switchView('kanban');
    await new Promise(r => setTimeout(r, 100));
    const hasKanban = !!document.querySelector('.kanban-board');
    console.log(`   ${hasKanban ? '✅' : '❌'} Kanban view: ${hasKanban ? 'rendered' : 'not found'}`);
    
    window.app.switchView('timeline');
    await new Promise(r => setTimeout(r, 100));
    const hasTimeline = !!document.querySelector('.timeline-view');
    console.log(`   ${hasTimeline ? '✅' : '❌'} Timeline view: ${hasTimeline ? 'rendered' : 'not found'}`);
    
    window.app.switchView('list');
    await new Promise(r => setTimeout(r, 100));
    const hasList = !!document.querySelector('.list-view');
    console.log(`   ${hasList ? '✅' : '❌'} List view: ${hasList ? 'rendered' : 'not found'}`);
    
    tests.push(hasKanban && hasTimeline && hasList);
  } catch (error) {
    console.log('   ❌ ERROR:', error.message);
    tests.push(false);
  }

  // Test 4: Blocked Task Detection
  console.log('\n%c4️⃣ Testing Blocked Task Detection...', 'font-weight: bold');
  try {
    const blocking = window.app.taskStore.create({ text: 'Blocking', category: 'data' });
    const blocked = window.app.taskStore.create({ text: 'Blocked', category: 'data', dependencies: [blocking.id] });
    
    const isBlocked = !window.app.taskStore.canComplete(blocked.id);
    console.log(`   ${isBlocked ? '✅' : '❌'} Task correctly blocked: ${isBlocked}`);
    
    window.app.taskStore.toggleComplete(blocking.id);
    const isUnblocked = window.app.taskStore.canComplete(blocked.id);
    console.log(`   ${isUnblocked ? '✅' : '❌'} Task correctly unblocked: ${isUnblocked}`);
    
    window.app.taskStore.delete(blocking.id);
    window.app.taskStore.delete(blocked.id);
    
    tests.push(isBlocked && isUnblocked);
  } catch (error) {
    console.log('   ❌ ERROR:', error.message);
    tests.push(false);
  }

  // Test 5: Project Manager
  console.log('\n%c5️⃣ Testing Project Manager...', 'font-weight: bold');
  try {
    const project = window.app.projectManager.create({ 
      name: 'Test Project', 
      description: 'Testing',
      color: '#3b82f6'
    });
    console.log('   ✅ Project created:', project.name);
    
    const stats = window.app.projectManager.getProjectStats(project.id, window.app.taskStore);
    console.log('   ✅ Project stats retrieved:', stats);
    
    window.app.projectManager.delete(project.id);
    console.log('   ✅ Project deleted');
    
    tests.push(true);
  } catch (error) {
    console.log('   ❌ ERROR:', error.message);
    tests.push(false);
  }

  // Summary
  setTimeout(() => {
    const passed = tests.filter(Boolean).length;
    const total = tests.length;
    const pct = Math.round((passed / total) * 100);
    
    console.log('\n' + '='.repeat(50));
    console.log(`%c🏆 Test Results: ${passed}/${total} passed (${pct}%)`, 
      `font-size: 16px; font-weight: bold; color: ${pct === 100 ? '#10b981' : '#f59e0b'}`);
    
    if (pct === 100) {
      console.log('%c✅ ALL TESTS PASSED - Phase 2 is READY!', 'color: #10b981; font-weight: bold');
    } else {
      console.log('%c⚠️ Some tests failed - check above for details', 'color: #f59e0b; font-weight: bold');
    }
    console.log('='.repeat(50));
  }, 500);
}

// Run tests
runTests();

