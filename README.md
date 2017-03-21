# BioCrowds
Biocrowds is a crowd simulation algorithm based on the formation of veination patterns on leaves. It prevents agents from colliding with each other on their way to their goal points using a notion of "personal space". Personal space is modelled with a space colonization algorithm. Markers (just points) are scattered throughout the simulation space, on the ground. At each simulation frame, each marker becomes "owned" by the agent closest to it (with some max distance representing an agent's perception). Agent velocity at the next frame is then computed using a sum of the displacement vectors to each of its markers. Because a marker can only be owned by one agent at a time, this technique prevents agents from colliding.

## Agent Representation (15 pts)
Create an agent class to hold properties used for simulating and drawing the agent. Some properties you may want to consider include the following:
- Position
- Velocity
- Goal
- Orientation
- Size
- Markers

## Grid/Marker Representation (25 pts)
Markers should be scattered randomly across a uniform grid. You should implement an efficient way of determining the nearest agent to a given marker. Based on an marker's location, you should be able to get the nearest four grid cells and loop through all the agents contained in them.

## Setup (10 pts)
- Create a scene (standard, with camera controls) and scatter markers across the entire ground plane
- Spawn agents with specified goal points

## Per Frame (35 pts)
- Assign markers to the nearest agent within a given radius. Be sure that a marker is only assigned to a single, unique agent.
- Compute velocity for each agent
- New velocity is determined by summing contributions from all the markers the agent "owns". Each marker contribution consists of the displacement vector between the agent and the marker multiplied by some (non-negative) weight. The weighting is based on
	- Similarity between the displacement vector and the vector to agent's goal (the more similar, the higher the weight. A dot product works well)
	- Distance from agent (the further away, the less contribution)
Each contribution is normalized by the total marker contributions (divide each contribution by sum total)
  - Clamp velocity to some maximum (you probably want to choose a max speed such that you agent will never move further than its marker radius)
- Move agents by their newly computed velocity * time step
- Draw a ground plane and cylinders to represent the agents.
- For a more thorough explanation, see [HERE](http://www.inf.pucrs.br/~smusse/Animacao/2016/CrowdTalk.pdf) and [HERE](http://www.sciencedirect.com/science/article/pii/S0097849311001713) and [HERE](https://books.google.com/books?id=3Adh_2ZNGLAC&pg=PA146&lpg=PA146&dq=biocrowds%20algorithm&source=bl&ots=zsM86iYTot&sig=KQJU7_NagMK4rbpY0oYc3bwCh9o&hl=en&sa=X&ved=0ahUKEwik9JfPnubSAhXIxVQKHUybCxUQ6AEILzAE#v=onepage&q=biocrowds%20algorithm&f=false) and [HERE](https://cis700-procedural-graphics.github.io/files/biocrowds_3_21_17.pdf)

## Two scenarios
- Create two different scenarios (initial agent placement, goals) to show off the collision avoidance. Try to pick something interesting! Classics include two opposing lines of agents with goals on opposite sides, or agents that spawn in a circle, which each agent's goal directly across.
- Provide some way to switch between scenarios

## Deploy your code! (5 pts)
- Your demo should run on your gh-pages branch

## Extra credit
- Add obstacles to your scene, such that agents avoid them