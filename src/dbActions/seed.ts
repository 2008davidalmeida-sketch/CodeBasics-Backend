import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import Challenge from '../models/Challenge'

const challenges = [
    // Tópico 1 — Programação
    {
        title: 'Primeiro Programa',
        description: 'Imprime o teu nome no ecrã usando a função print().',
        topic: 'Programação',
        order: 1,
        starterCode: '# Escreve o teu código aqui\n'
    },
    {
        title: 'Variáveis e Tipos',
        description: 'Declara variáveis dos tipos integer, float, string e boolean.',
        topic: 'Programação',
        order: 2,
        starterCode: '# Declara as tuas variáveis aqui\n'
    },
    {
        title: 'Input e Output',
        description: 'Pede o nome ao utilizador com input() e imprime uma mensagem personalizada do tipo "Olá, [nome]!".',
        topic: 'Programação',
        order: 3,
        starterCode: '# Pede o nome ao utilizador\n'
    },
    {
        title: 'Operadores Aritméticos',
        description: 'Dados dois números inteiros a = 15 e b = 4, calcula e imprime o resultado das seguintes operações: soma, subtração, multiplicação, divisão, divisão inteira e módulo.',
        topic: 'Programação',
        order: 4,
        starterCode: 'a = 15\nb = 4\n\n# Realiza as operações aqui\n'
    },
    {
        title: 'Area de um quadrado',
        description: 'Calcula a área de um quadrado dado o comprimento do lado introduzido pelo utilizador.',
        topic: 'Programação',
        order: 5,
        starterCode: '# Pede o comprimento do lado ao utilizador\n'
    },
    {
        title: 'Area de uma triangulo e de um circulo',
        description: 'Calcula e imprime o resultado da área de um triângulo e de um círculo. Para o triângulo, pede a base e a altura ao utilizador. Para o círculo, pede o raio ao utilizador.',
        topic: 'Programação',
        order: 6,
        starterCode: '# Pede os valores ao utilizador\n\n\n# Calcula as áreas aqui\n'
    },

    // Tópico 2 — Tipos de Dados Compostos
    {
        title: 'Criar Listas',
        description: 'Cria uma lista com os nomes de 5 colegas teus. Imprime a lista completa, o primeiro elemento, o último elemento e o número de elementos. A função len() pode ser útil para contar os elementos.',
        topic: 'Tipos de Dados Compostos',
        order: 7,
        starterCode: '# Cria a tua lista aqui\n'
    },
    {
        title: 'Operações com Listas',
        description: 'Dada a lista numeros = [3, 1, 4, 1, 5, 9, 2, 6], realiza as seguintes operações:\n1. Adiciona o número 7 ao fim da lista\n2. Remove o número 1 (primeira ocorrência)\n3. Ordena a lista\n4. As funções append(), remove() e sort() podem ser úteis para estas operações.',
        topic: 'Tipos de Dados Compostos',
        order: 8,
        starterCode: 'numeros = [3, 1, 4, 1, 5, 9, 2, 6]\n\n# Realiza as operações aqui\n'
    },
    {
        title: 'Criar Tuplos',
        description: 'Cria um tuplo com as coordenadas (x, y, z) = (10, 20, 30). Imprime cada coordenada individualmente. Calcula a norma do vetor representado por este tuplo usando a fórmula (x^2 + y^2 + z^2)^0.5.',
        topic: 'Tipos de Dados Compostos',
        order: 9,
        starterCode: '# Cria o teu tuplo aqui\n'
    },
    {
        title: 'Criar Dicionários',
        description: 'Cria um dicionário com informações de um aluno: nome, idade e turma. Imprime cada valor individualmente acedendo pela chave.',
        topic: 'Tipos de Dados Compostos',
        order: 10,
        starterCode: '# Cria o teu dicionário aqui\n'
    },
    {
        title: 'Operações com Dicionários',
        description: 'Dado o dicionário aluno = {"nome": "Ana", "idade": 17, "turma": "12ºA"}, realiza as seguintes operações:\n1. Adiciona a chave "nota" com o valor 18\n2. Atualiza a idade para 18 atraves da chave "idade"\n',
        topic: 'Tipos de Dados Compostos',
        order: 11,
        starterCode: 'aluno = {"nome": "Ana", "idade": 17, "turma": "12ºA"}\n\n# Realiza as operações aqui\n'
    },

    // Tópico 3 — Estruturas de Controlo
    {
        title: 'Seleção Simples',
        description: 'Pede um número ao utilizador e verifica se é positivo. Se for, imprime "O número é positivo.".',
        topic: 'Estruturas de Controlo',
        order: 14,
        starterCode: '# Pede o número ao utilizador\n'
    },
    {
        title: 'Seleção Composta',
        description: 'Pede um número ao utilizador e verifica se é par ou ímpar. Imprime "O número é par." ou "O número é ímpar." conforme o caso.',
        topic: 'Estruturas de Controlo',
        order: 15,
        starterCode: '# Pede o número ao utilizador\n'
    },
    {
        title: 'Seleção Encadeada',
        description: 'Pede uma nota (0-20) ao utilizador e classifica-a:\n- 0 a 9: Negativa\n- 10 a 13: Suficiente\n- 14 a 17: Bom\n- 18 a 20: Muito Bom\nImprime a classificação correspondente.',
        topic: 'Estruturas de Controlo',
        order: 16,
        starterCode: '# Pede a nota ao utilizador\n'
    },
    {
        title: 'Ciclo For - Imprimir Números',
        description: 'Cria um ciclo for para imprimir os números de 1 a 10, um por linha.',
        topic: 'Estruturas de Controlo',
        order: 19,
        starterCode: '# Usa um ciclo for\n'
    },
    {
        title: 'Ciclo For - Somar Números',
        description: 'Dada a lista numeros = [4, 7, 2, 9, 1, 5, 8, 3, 6], usa um ciclo for para calcular e imprimir a soma de todos os números.',
        topic: 'Estruturas de Controlo',
        order: 19,
        starterCode: 'numeros = [4, 7, 2, 9, 1, 5, 8, 3, 6]\n\n# Usa um ciclo for\n'
    },
    {
        title: 'Tabuada',
        description: 'Cria um ciclo for para imprimir a tabuada de um número introduzido pelo utilizador.',
        topic: 'Estruturas de Controlo',
        order: 19,
        starterCode: '# Usa um ciclo for\n'
    },
    {
        title: 'Calcular um fatorial',
        description: 'Cria um ciclo for para calcular o fatorial de um número introduzido pelo utilizador.',
        topic: 'Estruturas de Controlo',
        order: 19,
        starterCode: '# Usa um ciclo for\n'
    },
    {
        title: 'Desenhar um triangulo de asteriscos',
        description: 'Cria um ciclo for para desenhar um triângulo de asteriscos.',
        topic: 'Estruturas de Controlo',
        order: 19,
        starterCode: '# Usa um ciclo for\n'
    },
    {
        title: 'Ciclo While',
        description: 'Cria um programa que pede um número e mostre a contagem até zero',
        topic: 'Estruturas de Controlo',
        order: 19,
        starterCode: '# Usa um ciclo while\n'
    },
    {
        title: 'Validação de palavra-passe',
        description: 'Cria um programa que proceda à validação da palavra-passe.',
        topic: 'Estruturas de Controlo',
        order: 19,
        starterCode: '# Usa um ciclo while\n'
    },
    {
        title: 'Break',
        description: 'Dada a lista numeros = [3, 7, -2, 5, 1, -8, 4], percorre a lista com um ciclo for e para quando encontrares o primeiro número negativo usando break. Imprime todos os números antes de parar.',
        topic: 'Estruturas de Controlo',
        order: 20,
        starterCode: 'numeros = [3, 7, -2, 5, 1, -8, 4]\n\n# Usa break para parar no primeiro negativo\n'
    },

    // Tópico 4 — Modularização
    {
        title: 'Funções Internas - len()',
        description: 'Usa a função len() para calcular o comprimento de uma lista. Imprime o resultado.',
        topic: 'Modularização',
        order: 21,
        starterCode: 'lista = [1, 2, 3, 4, 5]\n\n# Calcular o comprimento da lista\n'
    },
    {
        title: 'Funções Internas - range()',
        description: 'Usa as funções internas do Python para:\n1. Calcular o comprimento de uma lista com len()\n2. Gerar uma sequência de números com range()\n3. Converter uma string em inteiro com int()\n4. Converter um número em string com str()\nImprime o resultado de cada operação.',
        topic: 'Modularização',
        order: 21,
        starterCode: '# Usa as funções internas aqui\n'
    },
    {
        title: 'Funções Internas',
        description: 'Usa as funções internas do Python para:\n1. Calcular o comprimento de uma lista com len()\n2. Gerar uma sequência de números com range()\n3. Converter uma string em inteiro com int()\n4. Converter um número em string com str()\nImprime o resultado de cada operação.',
        topic: 'Modularização',
        order: 21,
        starterCode: '# Usa as funções internas aqui\n'
    },
    {
        title: 'Criar Funções',
        description: 'Cria uma função chamada soma que recebe dois números como parâmetros e devolve a sua soma. Chama a função com diferentes valores e imprime os resultados.',
        topic: 'Modularização',
        order: 22,
        starterCode: '# Define a função soma aqui\n'
    },
    {
        title: 'Funções com Return',
        description: 'Cria uma função chamada is_primo que recebe um número inteiro e devolve True se for primo e False caso contrário. Testa a função com os números 2, 7, 10 e 13.',
        topic: 'Modularização',
        order: 23,
        starterCode: '# Define a função is_primo aqui\n'
    },
    {
        title: 'Importar Módulos',
        description: 'Importa o módulo random e usa-o para:\n1. Gerar 5 números aleatórios entre 1 e 100\n2. Escolher um elemento aleatório de uma lista\nImprime os resultados.',
        topic: 'Modularização',
        order: 24,
        starterCode: 'import random\n\n# Usa o módulo random aqui\n'
    },
    {
        title: 'Módulo Math',
        description: 'Importa o módulo math e usa-o para:\n1. Calcular a raiz quadrada de 144\n2. Arredondar 3.7 para cima com ceil()\n3. Arredondar 3.7 para baixo com floor()\n4. Imprimir o valor de pi\nImprime todos os resultados.',
        topic: 'Modularização',
        order: 25,
        starterCode: 'import math\n\n# Usa o módulo math aqui\n'
    },
    {
        title: 'Biblioteca Matplotlib',
        description: 'Usa a biblioteca matplotlib para criar um gráfico de barras com os seguintes dados:\n- Meses: ["Jan", "Fev", "Mar", "Abr", "Mai"]\n- Vendas: [150, 200, 180, 220, 170]\nAdiciona um título e labels nos eixos.',
        topic: 'Modularização',
        order: 26,
        starterCode: 'import matplotlib.pyplot as plt\n\nmeses = ["Jan", "Fev", "Mar", "Abr", "Mai"]\nvendas = [150, 200, 180, 220, 170]\n\n# Cria o gráfico aqui\n'
    },

    // Tópico 5 — Arrays
    {
        title: 'Criar Arrays',
        description: 'Importa o módulo numpy e cria um array com os números [10, 20, 30, 40, 50]. Imprime o array completo, o primeiro elemento, o último elemento e o tamanho do array.',
        topic: 'Arrays',
        order: 27,
        starterCode: 'import numpy as np\n\n# Cria o teu array aqui\n'
    },
    {
        title: 'Operações com Arrays',
        description: 'Cria dois arrays com numpy: a = [1, 2, 3, 4, 5] e b = [10, 20, 30, 40, 50]. Realiza e imprime:\n1. Soma dos dois arrays\n2. Multiplicação dos dois arrays\n3. Média do array a\n4. Soma de todos os elementos do array b',
        topic: 'Arrays',
        order: 28,
        starterCode: 'import numpy as np\n\na = np.array([1, 2, 3, 4, 5])\nb = np.array([10, 20, 30, 40, 50])\n\n# Realiza as operações aqui\n'
    },
]

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI as string)

        // clear existing challenges
        await Challenge.deleteMany({})
        

        // insert all challenges
        await Challenge.insertMany(challenges.map(c => ({
            ...c,
            createdBy: new mongoose.Types.ObjectId()
        })))

        
        process.exit(0)
    } catch (error) {
        console.error('Seed error:', error)
        process.exit(1)
    }
}

seed()