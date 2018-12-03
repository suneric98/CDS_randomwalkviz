# CDS Wiki-Insights Randomwalk Viz
A visualization for the Cornell Data Science Wiki-Insights random walk algorithm written with D3

To view, go to https://suneric98.github.io/CDS_randomwalkviz/. This viz was created for the random walk algorithm designed by the Wiki Insights team, from the Data Insights subteam of Cornell Data Science. It was created in javascript D3. The random walk algorithm is an algorithm that takes a hierarchy of articles from wikipedia starting from a base article (for example, Linear Algebra) and randomly walks down a path based on the similarity values between the articles the walk is at and the articles the walk can get to. The probability is scaled by the similarity value between these articles and is further determined by an automated threshold value that decides how low the similarity value is allowed to be between articles. Further variables also help decide where the random walk goes, such as pagerank. The Wiki team is also working to further improve the logistics of the similarity values and random walk algorithm, but this vizualisation hopefully clarifies what exactly we are attempting to accomplish and can help us see how exactly our algorithm is performing.

Features:
+ Zoom in by scrolling
+ Mouse over nodes to see the name of that node and the paths that go through them.
+ Mouse over lines to see the similarity value between the nodes, what path that line corresponds to, and what step of the path that line is.
+ Deselect certain paths to make the vizualisation more clearer and allow for more detailed insight
+ If the graph is too crowded, deselect the "Display Names of Nodes" checkbox to turn off the node text. You can still mouse over the nodes to see the name of that node
+ To switch between graphs, select the drop down menu next to the "Select Graph" button then choose which cluster you want to look at. Currently, the only two are "Linear Algebra" and "Hevea Brasiliensis"
