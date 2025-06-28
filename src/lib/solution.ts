export interface Step {
	jugX: number;
	jugY: number;
	explanation: string;
}

interface State {
	x: number;
	y: number;
	path: Step[];
}

/**
 * Calculate the Greatest Common Divisor (GCD) of two numbers
 */
export function gcd(a: number, b: number): number {
	while (b !== 0) {
		const temp = b;
		b = a % b;
		a = temp;
	}
	return a;
}

/**
 * Check if the water jug problem can be solved
 * A solution exists if:
 * 1. The target Z is not greater than the maximum capacity of both jugs
 * 2. The target Z is divisible by the GCD of the two jug capacities
 */
export function canSolve(x: number, y: number, z: number): boolean {
	if (z > Math.max(x, y)) return false;
	return z % gcd(x, y) === 0;
}

/**
 * Solve the water jug problem using Breadth-First Search (BFS)
 */
export async function solveWaterJug(x: number, y: number, z: number): Promise<Step[]> {
	if (!canSolve(x, y, z)) return [];

	const visited = new Set<string>();
	const queue: State[] = [];

	// Start with both jugs empty
	const initialState: State = {
		x: 0,
		y: 0,
		path: [{ jugX: 0, jugY: 0, explanation: 'Start with both jugs empty' }]
	};

	queue.push(initialState);
	visited.add('0,0');

	while (queue.length > 0) {
		const current = queue.shift()!;

		// Check if we've reached the target
		if (current.x === z || current.y === z) {
			return current.path;
		}

		const nextStates = generateNextStates(current, x, y);

		for (const nextState of nextStates) {
			const stateKey = `${nextState.x},${nextState.y}`;

			if (!visited.has(stateKey)) {
				visited.add(stateKey);
				queue.push(nextState);
			}
		}

		// Yield control occasionally for very large problems
		if (visited.size % 1000 === 0) {
			await new Promise((resolve) => setTimeout(resolve, 0));
		}

		if (visited.size > 10000) {
			console.warn('Maximum states explored, terminating search');
			break;
		}
	}

	return [];
}

/**
 * Generate all possible next states from the current state
 */
function generateNextStates(current: State, x: number, y: number): State[] {
	const states: State[] = [];

	// Fill jug X
	if (current.x < x) {
		states.push({
			x: x,
			y: current.y,
			path: [...current.path, { jugX: x, jugY: current.y, explanation: `Fill jug X (${x}L)` }]
		});
	}

	// Fill jug Y
	if (current.y < y) {
		states.push({
			x: current.x,
			y: y,
			path: [...current.path, { jugX: current.x, jugY: y, explanation: `Fill jug Y (${y}L)` }]
		});
	}

	// Empty jug X
	if (current.x > 0) {
		states.push({
			x: 0,
			y: current.y,
			path: [...current.path, { jugX: 0, jugY: current.y, explanation: 'Empty jug X' }]
		});
	}

	// Empty jug Y
	if (current.y > 0) {
		states.push({
			x: current.x,
			y: 0,
			path: [...current.path, { jugX: current.x, jugY: 0, explanation: 'Empty jug Y' }]
		});
	}

	// Transfer from X to Y
	if (current.x > 0 && current.y < y) {
		const transferAmount = Math.min(current.x, y - current.y);
		states.push({
			x: current.x - transferAmount,
			y: current.y + transferAmount,
			path: [
				...current.path,
				{
					jugX: current.x - transferAmount,
					jugY: current.y + transferAmount,
					explanation: 'Transfer from jug X to jug Y'
				}
			]
		});
	}

	// Transfer from Y to X
	if (current.y > 0 && current.x < x) {
		const transferAmount = Math.min(current.y, x - current.x);
		states.push({
			x: current.x + transferAmount,
			y: current.y - transferAmount,
			path: [
				...current.path,
				{
					jugX: current.x + transferAmount,
					jugY: current.y - transferAmount,
					explanation: 'Transfer from jug Y to jug X'
				}
			]
		});
	}

	return states;
}

/**
 * Get the status description of a jug based on its current amount and capacity
 */
export function getJugStatus(current: number, capacity: number): string {
	if (current === 0) return 'Empty';
	if (current === capacity) return 'Full';
	return 'Partially Full';
}
