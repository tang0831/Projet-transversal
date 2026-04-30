def knapsack(capacity, weights, values, n):
    """
    Standard 0/1 Knapsack problem using Dynamic Programming.
    :param capacity: Maximum weight capacity
    :param weights: List of weights of items
    :param values: List of values of items
    :param n: Number of items
    :return: Maximum value that can be obtained
    """
    dp = [[0 for _ in range(capacity + 1)] for _ in range(n + 1)]

    for i in range(n + 1):
        for w in range(capacity + 1):
            if i == 0 or w == 0:
                dp[i][w] = 0
            elif weights[i - 1] <= w:
                dp[i][w] = max(values[i - 1] + dp[i - 1][w - weights[i - 1]], dp[i - 1][w])
            else:
                dp[i][w] = dp[i - 1][w]

    return dp[n][capacity]

def get_selected_items(capacity, weights, values, n):
    """
    Returns the indices of selected items for the maximum value.
    """
    dp = [[0 for _ in range(capacity + 1)] for _ in range(n + 1)]

    for i in range(n + 1):
        for w in range(capacity + 1):
            if i == 0 or w == 0:
                dp[i][w] = 0
            elif weights[i - 1] <= w:
                dp[i][w] = max(values[i - 1] + dp[i - 1][w - weights[i - 1]], dp[i - 1][w])
            else:
                dp[i][w] = dp[i - 1][w]

    res = dp[n][capacity]
    w = capacity
    items = []

    for i in range(n, 0, -1):
        if res <= 0:
            break
        if res == dp[i - 1][w]:
            continue
        else:
            items.append(i - 1)
            res -= values[i - 1]
            w -= weights[i - 1]
            
    return items
