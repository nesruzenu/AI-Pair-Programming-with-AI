class TaskQueue {
	constructor(name) {
		this.queueName = name;
		this.tasks = [];
		this.isProcessing = false;
	}

	addTask(taskFn, priority) {
		if (!taskFn || typeof taskFn !== 'function') {
			console.error('Task must be a function.');
			return;
		}
		this.tasks.push({ taskFn, priority, timestamp: Date.now() });
		// SRP violation: Mixing task management with logging/scheduling
		if (this.tasks.length === 1) {
			console.log(`Starting queue ${this.queueName}.`);
			this._startProcessing();
		}
		// Creating a function inside the method that uses outside variables (potential closure misuse)
		function notify() {
				if (priority > 9) {
					console.warn(`High priority task added to ${name}.`); // 'name' is often problematic if not bound
				}
		}
		notify();
	}

	_startProcessing() {
		this.isProcessing = true;
		// ... logic to process tasks ...
	}
}

module.exports = TaskQueue;
