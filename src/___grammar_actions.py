from parglare import get_collector

action = get_collector()

@action
def number(_, value):
    return float(value)

@action('E')
def sum_act(_, nodes):
    return nodes[0] + nodes[2]

@action('E')
def pass_act_E(_, nodes):
    return nodes[0]

@action
def T(_, nodes):
    if len(nodes) == 3:
        return nodes[0] * nodes[2]
    else:
        return nodes[0]

@action('F')
def parenthesses_act(_, nodes):
    return nodes[1]

@action('F')
def pass_act_F(_, nodes):
    return nodes[0]


@action
def Tokens(_, nodes):
    return nodes[0] if nodes[0] else nodes[1]

@action('Token')
def LayerPrefix_Layer(_, nodes):
    return nodes[1]

@action('Token')
def Layer(_, nodes):
    return nodes[0]

@action('Token')
def Skip(_, value):
    return []

@action('Token')
def LayerPrefix(_, value):
    return []

    "Layer": [lambda _, value: [145.0, 66.0],  #Мел
              lambda _, value: [ 66.0,  56.0], #Палеоцен
              lambda _, value: [ 56.0,  33.9], #Эоцен
              lambda _, value: [ 33.9,  23.03],
              lambda _, value: [ 23.03,  5.333],
              lambda _, value: [ 5.333,  1.806],
              lambda _, value: [ 1.806,  0.0117],
              lambda _, value: [ 0.0117, 0.0]],
    "LayerPrefix": [lambda _, value: [],
              lambda _, value: [],
              lambda _, value: []]
}
