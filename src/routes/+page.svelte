<script lang="ts">
	import { solveWaterJug, gcd, type Step } from '$lib/solution';

	let jugX = $state(2);
	let jugY = $state(10);
	let targetZ = $state(4);
	let solution = $state<Step[]>([]);
	let noSolution = $state(false);
	let isCalculating = $state(false);

	// Quick test cases
	const testCases = [
		{ name: 'Basic', x: 2, y: 10, z: 4 },
		{ name: 'Classic', x: 3, y: 5, z: 4 },
		{ name: 'Impossible', x: 2, y: 6, z: 5 },
		{ name: 'Large', x: 2, y: 100, z: 96 },
		{ name: 'Equal', x: 7, y: 7, z: 3 },
		{ name: 'Simple', x: 5, y: 8, z: 8 },
		{ name: 'Complex', x: 61, y: 37, z: 1 },
		{ name: 'Minimal', x: 4, y: 6, z: 2 }
	];

	async function solve() {
		if (jugX <= 0 || jugY <= 0 || targetZ <= 0) {
			alert('All values must be greater than 0');
			return;
		}

		isCalculating = true;
		solution = [];
		noSolution = false;

		try {
			const result = await solveWaterJug(jugX, jugY, targetZ);
			if (result.length === 0) {
				noSolution = true;
			} else {
				solution = result;
			}
		} catch (error) {
			console.error('Error:', error);
			alert('Error calculating solution');
		} finally {
			isCalculating = false;
		}
	}

	function loadTest(testCase: (typeof testCases)[0]) {
		jugX = testCase.x;
		jugY = testCase.y;
		targetZ = testCase.z;
		reset();
		solve();
	}

	function reset() {
		solution = [];
		noSolution = false;
	}
</script>

<svelte:head>
	<title>Oluwaseyifunmi Water Jug Solver</title>
	<meta
		name="description"
		content="Solve the classic water jug riddle using BFS. Interactive web app to find the shortest steps to measure exact amounts with two jugs."
	/>
	<link rel="icon" href="/favicon.ico" />
</svelte:head>

<div class="container">
	<header>
		<h1>Oluwaseyifunmi Water Jug Solver</h1>
		<p>
			This is an interactive web application that helps you solve the classic Water Jug Riddle using
			BFS (Breadth-First Search).
		</p>
	</header>

	<main>
		<div class="input-section">
			<h2>Setup</h2>

			<div class="test-cases">
				<p class="test-case-header">Quick Tests:</p>
				<div class="test-buttons">
					{#each testCases as test}
						<button class="test-btn" onclick={() => loadTest(test)} disabled={isCalculating}>
							{test.name} ({test.x},{test.y}→{test.z})
						</button>
					{/each}
				</div>
			</div>

			<div class="inputs">
				<div class="input-group">
					<label for="jugX">Jug X Capacity:</label>
					<input id="jugX" type="number" bind:value={jugX} min="1" max="1000" oninput={reset} />
				</div>
				<div class="input-group">
					<label for="jugY">Jug Y Capacity:</label>
					<input id="jugY" type="number" bind:value={jugY} min="1" max="1000" oninput={reset} />
				</div>
				<div class="input-group">
					<label for="targetZ">Target Amount:</label>
					<input
						id="targetZ"
						type="number"
						bind:value={targetZ}
						min="1"
						max="1000"
						oninput={reset}
					/>
				</div>
			</div>

			<button class="solve-btn" onclick={solve} disabled={isCalculating}>
				{isCalculating ? 'Calculating...' : 'Solve'}
			</button>
		</div>

		<div class="results-section">
			<h2>Results</h2>

			{#if isCalculating}
				<div class="calculating">
					<div class="spinner"></div>
					<p>Finding optimal solution...</p>
				</div>
			{:else if noSolution}
				<div class="no-solution">
					<h3>No Solution Possible</h3>
					<p>
						It is not possible to measure exactly {targetZ} gallons using jugs of {jugX}
						and {jugY} gallons.
					</p>
					<div class="explanation">
						<strong>Why there is no solution:</strong>
						<p>A solution exists only if:</p>
						<ul>
							<li>
								The target amount ({targetZ}) is ≤ the larger jug capacity ({Math.max(jugX, jugY)})
							</li>
							<li>
								The target amount is divisible by <code
									>GCD({jugX}, {jugY}) = {gcd(jugX, jugY)}</code
								>
							</li>
						</ul>
						<p>
							In this case: {targetZ} ÷ {gcd(jugX, jugY)} = {(targetZ / gcd(jugX, jugY)).toFixed(2)}
						</p>
					</div>
				</div>
			{:else if solution.length > 0}
				<div class="solution">
					<div class="solution-header">
						<div class="summary">
							<strong>Solution found in {solution.length} steps</strong>
						</div>
					</div>

					<div class="steps">
						<div class="step-header">
							<span>Step</span>
							<span>Jug X ({jugX}L)</span>
							<span>Jug Y ({jugY}L)</span>
							<span>Action</span>
						</div>
						{#each solution as step, index}
							<div class="step" class:target={step.jugX === targetZ || step.jugY === targetZ}>
								<span class="step-num">{index + 1}</span>
								<span class="jug-state">{step.jugX}</span>
								<span class="jug-state">{step.jugY}</span>
								<span class="action">{step.explanation}</span>
							</div>
						{/each}
					</div>
				</div>
			{:else}
				<div class="placeholder">
					<p>Enter jug capacities and target amount, then click Solve to see the solution.</p>
				</div>
			{/if}
		</div>
	</main>

	<section class="algorithm-section">
		<h2>Algorithm Explanation</h2>
		<div class="algorithm-content">
			<h3>Breadth-First Search (BFS) Approach</h3>
			<p>This solution uses BFS to guarantee that we find the shortest solution:</p>

			<div class="algorithm-details">
				<div class="detail-section">
					<h4>How it works:</h4>
					<ol>
						<li>
							We use the <strong>Greatest Common Divisor (GCD)</strong> to determine if a solution exists
						</li>
						<li>We explore all possible jug states level by level</li>
						<li>BFS ensures the first solution found uses the shortest possible steps</li>
						<li>We track the visited states to avoid an infinite loop</li>
					</ol>
				</div>

				<div class="detail-section">
					<h4>Available Operations:</h4>
					<ul>
						<li>Fill jug X to capacity</li>
						<li>Fill jug Y to capacity</li>
						<li>Empty jug X completely</li>
						<li>Empty jug Y completely</li>
						<li>Transfer from jug X to jug Y</li>
						<li>Transfer from jug Y to jug X</li>
					</ul>
				</div>

				<div class="detail-section">
					<h4>Mathematical Theory:</h4>
					<p>A solution exists if and only if:</p>
					<ul>
						<li>Target <code>amount ≤ max(jug X capacity, jug Y capacity)</code></li>
						<li>
							Target <code>amount</code> is divisible by
							<code>GCD(jug X capacity, jug Y capacity)</code>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</section>
</div>

<style>
	* {
		box-sizing: border-box;
	}

	.container {
		max-width: 1000px;
		margin: 0 auto;
		padding: 20px;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		background: #f8f9fa;
		min-height: 100vh;
	}

	header {
		text-align: center;
		margin-bottom: 30px;
		padding: 20px;
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	h1 {
		margin: 0 0 10px 0;
		color: #2c3e50;
		font-size: 28px;
		font-weight: 600;
	}

	header p {
		margin: 0;
		color: #6c757d;
		font-size: 16px;
	}

	main {
		display: grid;
		grid-template-columns: 1fr 1.5fr;
		gap: 20px;
	}

	.input-section,
	.results-section {
		background: white;
		padding: 25px;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	h2 {
		margin: 0 0 20px 0;
		color: #2c3e50;
		font-size: 20px;
		font-weight: 600;
		border-bottom: 2px solid #e9ecef;
		padding-bottom: 8px;
	}

	.test-cases {
		margin-bottom: 25px;
	}

	.test-cases .test-case-header {
		display: block;
		margin-bottom: 10px;
		font-weight: 500;
		color: #495057;
	}

	.test-buttons {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 8px;
	}

	.test-btn {
		padding: 8px 12px;
		border: 1px solid #dee2e6;
		background: #f8f9fa;
		border-radius: 4px;
		cursor: pointer;
		font-size: 12px;
		transition: all 0.2s;
	}

	.test-btn:hover:not(:disabled) {
		background: #e9ecef;
		border-color: #adb5bd;
	}

	.test-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.inputs {
		display: grid;
		gap: 15px;
		margin-bottom: 25px;
	}

	.input-group {
		display: flex;
		flex-direction: column;
	}

	.input-group label {
		margin-bottom: 5px;
		font-weight: 500;
		color: #495057;
	}

	input {
		padding: 10px;
		border: 1px solid #ced4da;
		border-radius: 4px;
		font-size: 14px;
	}

	input:focus {
		outline: none;
		border-color: #495057;
		box-shadow: 0 0 0 2px rgba(73, 80, 87, 0.1);
	}

	.solve-btn {
		width: 100%;
		padding: 12px;
		background: #495057;
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 16px;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.solve-btn:hover:not(:disabled) {
		background: #343a40;
	}

	.solve-btn:disabled {
		background: #6c757d;
		cursor: not-allowed;
	}

	.calculating {
		text-align: center;
		padding: 40px;
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid #e9ecef;
		border-top: 3px solid #495057;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto 15px;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.no-solution {
		padding: 25px;
		background: #f8f9fa;
		border: 1px solid #dee2e6;
		border-radius: 4px;
	}

	.no-solution h3 {
		margin: 0 0 10px 0;
		color: #6c757d;
	}

	.explanation {
		font-size: 14px;
		color: #6c757d;
		background: white;
		padding: 15px;
		border-radius: 4px;
		margin-top: 15px;
	}

	.explanation ul {
		margin: 10px 0;
		padding-left: 20px;
	}

	.explanation li {
		margin-bottom: 5px;
	}

	.solution {
		border: 1px solid #dee2e6;
		border-radius: 4px;
		overflow: hidden;
	}

	.solution-header {
		background: #f8f9fa;
		padding: 15px;
		border-bottom: 1px solid #dee2e6;
	}

	.summary {
		color: #495057;
	}

	.steps {
		display: grid;
		gap: 1px;
		background: #dee2e6;
		max-height: 400px;
		overflow-y: auto;
	}

	.step-header {
		display: grid;
		grid-template-columns: 60px 1fr 1fr 2fr;
		gap: 15px;
		padding: 12px 15px;
		background: #e9ecef;
		font-weight: 600;
		font-size: 14px;
		color: #495057;
		position: sticky;
		top: 0;
		z-index: 1;
	}

	.step {
		display: grid;
		grid-template-columns: 60px 1fr 1fr 2fr;
		gap: 15px;
		padding: 12px 15px;
		background: white;
		font-size: 14px;
	}

	.step.target {
		background: #f8f9fa;
	}

	.step-num {
		font-weight: 600;
		color: #495057;
		text-align: center;
	}

	.jug-state {
		font-weight: 500;
		color: #2c3e50;
	}

	.action {
		color: #6c757d;
	}

	.placeholder {
		text-align: center;
		padding: 40px;
		color: #6c757d;
	}

	.algorithm-section {
		background: white;
		padding: 25px;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		margin-top: 20px;
	}

	.algorithm-content {
		color: #495057;
		line-height: 1.6;
	}

	.algorithm-content h3 {
		margin: 0 0 15px 0;
		color: #2c3e50;
		font-size: 18px;
	}

	.algorithm-details {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 20px;
		margin-top: 20px;
	}

	.detail-section {
		background: #f8f9fa;
		padding: 20px;
		border-radius: 4px;
		border-left: 4px solid #495057;
	}

	.detail-section h4 {
		margin: 0 0 10px 0;
		color: #2c3e50;
		font-size: 16px;
	}

	.detail-section ol,
	.detail-section ul {
		margin: 10px 0;
		padding-left: 20px;
	}

	.detail-section li {
		margin-bottom: 8px;
	}

	@media (max-width: 768px) {
		main {
			grid-template-columns: 1fr;
		}

		.container {
			padding: 15px;
		}

		.test-buttons {
			grid-template-columns: repeat(2, 1fr);
		}

		.step-header,
		.step {
			grid-template-columns: 40px 80px 80px 1fr;
			gap: 10px;
			font-size: 13px;
		}

		.algorithm-details {
			grid-template-columns: 1fr;
		}
	}

	code {
		white-space: pre-wrap;
		word-wrap: break-word;
		overflow-wrap: break-word;
		background: #a9aaac;
		padding: 2px 4px;
		border-radius: 4px;
		font-family: 'Courier New', Courier, monospace;
		font-size: 14px;
		color: #343a40;
		margin: 0 2px;
		font-weight: 600;
	}
</style>
