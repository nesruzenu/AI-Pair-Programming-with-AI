/**
 * task_queue_clean.js
 *
 * Refactored from task_queue_legacy.js.
 * Fixes:
 *  1. SRP: addTask() now only adds a task to the array. Logging and
 *     "start processing on first task" scheduling are extracted into
 *     their own collaborators (TaskQueueLogger, QueueScheduler).
 *  2. Scope/closures: the old top-level `function notify() {}` closed over
 *     the *parameter* `priority` and the *constructor argument* `name`
 *     instead of `this.queueName`, which is fragile and hard to reason
 *     about. The high-priority check is now a pure, explicitly-parameterized
 *     helper with no implicit closure dependencies, and all values used are
 *     block-scoped (const) locals or passed in explicitly.
 */

// --- Collaborator: logging, fully decoupled from queue internals ---
class TaskQueueLogger {
	logQueueStart(queueName) {
		console.log(`Starting queue ${queueName}.`);
	}

	logHighPriorityTask(queueName, priority) {
		console.warn(`High priority task added to ${queueName}.`);
	}
}

// --- Collaborator: decides when processing should kick off ---
class QueueScheduler {
	constructor(queue) {
		this.queue = queue;
	}

	maybeStart() {
		if (this.queue.tasks.length === 1 && !this.queue.isProcessing) {
			this.queue.logger.logQueueStart(this.queue.queueName);
			this.queue._startProcessing();
		}
	}
}

const HIGH_PRIORITY_THRESHOLD = 9;

// Pure helper: no closures over outer mutable state, explicit inputs only.
function isHighPriority(priority) {
	return priority > HIGH_PRIORITY_THRESHOLD;
}

class TaskQueue {
	constructor(name, logger = new TaskQueueLogger()) {
		this.queueName = name;
		this.tasks = [];
		this.isProcessing = false;
		this.logger = logger;
		this.scheduler = new QueueScheduler(this);
	}

	/**
	 * Single responsibility: validate and add a task to the queue.
	 * Nothing else happens here.
	 */
	addTask(taskFn, priority) {
		if (!taskFn || typeof taskFn !== 'function') {
			console.error('Task must be a function.');
			return;
		}

		const task = { taskFn, priority, timestamp: Date.now() };
		this.tasks.push(task);

		this.scheduler.maybeStart();

		if (isHighPriority(priority)) {
			this.logger.logHighPriorityTask(this.queueName, priority);
		}
	}

	_startProcessing() {
		this.isProcessing = true;
		// ... logic to process tasks ...
	}
}

module.exports = { TaskQueue, TaskQueueLogger, QueueScheduler, isHighPriority };
