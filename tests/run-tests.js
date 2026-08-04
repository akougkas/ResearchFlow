// Polyfill localStorage for Node environment testing BEFORE imports
if (typeof localStorage === 'undefined') {
    const memoryStorage = {};
    global.localStorage = {
        getItem: (key) => memoryStorage[key] || null,
        setItem: (key, val) => { memoryStorage[key] = String(val); },
        removeItem: (key) => { delete memoryStorage[key]; },
        clear: () => { Object.keys(memoryStorage).forEach(k => delete memoryStorage[k]); }
    };
}

import { Task, Project } from '../src/core/data-models.js';
import { ExportImportEngine } from '../src/core/exportImport.js';
import { VoiceCaptureEngine } from '../src/features/voice-capture.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✅ PASS: ${message}`);
        passed++;
    } else {
        console.error(`  ❌ FAIL: ${message}`);
        failed++;
    }
}

function assertThrows(fn, message) {
    try {
        fn();
        console.error(`  ❌ FAIL (Expected error): ${message}`);
        failed++;
    } catch (err) {
        console.log(`  ✅ PASS (Caught expected error): ${message} -> "${err.message}"`);
        passed++;
    }
}

async function runTests() {
    console.log('🧪 Starting ResearchFlow Beta Verification Test Suite...\n');

    // TEST 1: Task Data Models & Validation
    console.log('--- TEST GROUP 1: Task & Project Data Models ---');
    const task1 = new Task({ text: 'Sequence DNA samples', category: 'experiment', priority: 'high' });
    assert(task1.text === 'Sequence DNA samples', 'Task initializes text correctly');
    assert(task1.category === 'experiment', 'Task initializes category correctly');
    assert(task1.completed === false, 'New task is incomplete by default');
    assert(task1.validate() === true, 'Task validation succeeds for valid text');

    assertThrows(() => {
        new Task({ text: '' }).validate();
    }, 'Task validation fails for empty text');

    const project1 = new Project({ name: 'Genomics Study', description: 'RNA-Seq Analysis' });
    assert(project1.name === 'Genomics Study', 'Project model instantiates correctly');

    // TEST 2: TaskStore Operations & Dependencies
    console.log('\n--- TEST GROUP 2: TaskStore & Dependency Resolution ---');
    const { taskStore } = await import('../src/core/taskStore.js');

    const tA = taskStore.create({ text: 'Task A (Primary Protocol)', category: 'experiment' });
    const tB = taskStore.create({ text: 'Task B (Dependent Protocol)', category: 'data', dependencies: [tA.id] });

    assert(tB.dependencies.includes(tA.id), 'Task B depends on Task A');
    assert(taskStore.canComplete(tB.id) === false, 'Task B is blocked while Task A is incomplete');

    taskStore.toggleComplete(tA.id);
    assert(taskStore.canComplete(tB.id) === true, 'Task B is unblocked after Task A is completed');

    assertThrows(() => {
        taskStore.update(tA.id, { dependencies: [tB.id] });
    }, 'Circular dependency detection prevents A -> B -> A cycle');

    // TEST 3: Bi-Directional Wiki Link Parser
    console.log('\n--- TEST GROUP 3: Bi-Directional Wiki Link Parsing ---');
    const tLinkTarget = taskStore.create({ text: 'Reference Target Task', category: 'literature' });
    const tLinkSource = taskStore.create({ text: 'Source Task', notes: `Referencing [[Task:${tLinkTarget.id}]] in notebook` });

    assert(tLinkSource.links.includes(tLinkTarget.id), 'Wiki link [[Task:id]] parsed into links array');
    assert(tLinkTarget.backlinks.includes(tLinkSource.id), 'Backlink auto-populated in target task');

    // TEST 4: Export & Import Engine
    console.log('\n--- TEST GROUP 4: Workspace Export / Import Engine ---');
    const jsonStr = ExportImportEngine.exportWorkspaceJSON();
    const exportData = JSON.parse(jsonStr);
    assert(typeof exportData.version === 'string', 'Export includes schema version');
    assert(Array.isArray(exportData.tasks), 'Export contains tasks array');
    assert(exportData.tasks.length >= 3, 'All active tasks included in export');

    const markdownNotebook = ExportImportEngine.exportNotebookMarkdown();
    assert(markdownNotebook.includes('# 🔬 ResearchFlow - Notebook Export'), 'Markdown notebook header generated');
    assert(markdownNotebook.includes('Task A (Primary Protocol)'), 'Markdown notebook contains task entries');

    // TEST 5: Voice Auto-Categorization Engine
    console.log('\n--- TEST GROUP 5: Voice Dictation Auto-Categorization ---');
    const voiceEngine = new VoiceCaptureEngine();
    assert(voiceEngine.autoCategorize('Run python script for statistical differential expression') === 'data', 'Auto-detects data category');
    assert(voiceEngine.autoCategorize('Prepare slides for lab meeting demo') === 'presentation', 'Auto-detects presentation category');
    assert(voiceEngine.autoCategorize('Draft section 3 of paper manuscript') === 'writing', 'Auto-detects writing category');
    assert(voiceEngine.autoCategorize('Submit NSF proposal budget') === 'funding', 'Auto-detects funding category');

    // SUMMARY
    console.log('\n========================================');
    console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================\n');

    if (failed > 0) {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('Test execution error:', err);
    process.exit(1);
});
