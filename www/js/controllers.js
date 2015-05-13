angular.module('starter.controllers', [])

.controller('LoginCtrl', function ($scope, $ionicModal, $timeout, $ionicPopup, $state, $ionicLoading, $rootScope) {

    $rootScope.logado = false; //variável utilizada para exibir os botoes Perfil e Sair no menu.
    $rootScope.logado_facebook = false;
    //Verifica primeiramente se há informacoes do facebook já guardadas. Caso positivo, pula a tela de login.
    if (localStorage.getItem('token') != "null" && localStorage.getItem('token') != null) {
        $rootScope.logado_facebook = true; //Temporario. Deve ficar dentro do metodo logarAutomatico() que nao está sendo chamado.
        //logarAutomatico(); //VERIFICAR PQ NAO ESTÁ ABRINDO AUTOMATICAMENTE PELO CELULAR
    }

    //Form data para o modal de login
    $scope.loginData = {};

    // Cria modais para telas de novo usuário e esqueceu a senha
    $ionicModal.fromTemplateUrl('templates/cadastrarNovoUsuario.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modalNovoUsuario = modal;
    });
    $ionicModal.fromTemplateUrl('templates/esqueceuSenha.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modalEsqueceuSenha = modal;
    });

    // Usada no modal para fechar a tela
    $scope.closeNovoUsuario = function () {
        $scope.modalNovoUsuario.hide();
    };
    $scope.closeEsqueceuSenha = function () {
        $scope.modalEsqueceuSenha.hide();
    };

    // Abrir modais
    $scope.abrirTelaCadastroUsuario = function () {
        $scope.modalNovoUsuario.show();
    };
    $scope.abrirTelaEsqueceuSenha = function () {
        $scope.modalEsqueceuSenha.show();
    };

    // Logar sem facebook
    $scope.logar = function () {
        console.log('logando', $scope.loginData);
        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function () {
            //$scope.closeLogin();
            $rootScope.logado = true;
            $rootScope.logado_facebook = false;
            $state.go('app.temas');
            //alert("teste");
        }, 1000);
    };

    //Jogar sem logar
    $scope.jogarAgora = function () {
        $timeout(function () {
            //$scope.closeLogin();
            $state.go('app.temas');
            //alert("teste");
        }, 1000);
    };

    //Logar com facebook
    $scope.fbLogin = function () {
        //mostrar "loading" para aguardar carregamento da tela do face
        //$ionicLoading.show({
        //    content: 'Carregando',
        //    animation: 'fade-in',
        //    showBackdrop: true,
        //    maxWidth: 200,
        //    showDelay: 0
        //});

        openFB.login(
            function (response) {
                if (response.status === 'connected') {
                    console.log('Facebook login succeeded');
                    $ionicPopup.hide;
                    localStorage.clear();
                    localStorage.setItem('token', response.authResponse.token);
                    //$ionicLoading.hide(); //esconder loading
                    //$state.go('app.userInfo')
                    $rootScope.logado_facebook = true;
                    $rootScope.logado = false;
                    $state.go('app.temas')
                } else {
                    //$ionicLoading.hide(); //esconder loading
                    alert('Facebook login failed');
                }
            },
            { scope: 'email,publish_actions' });
    };

    function logarAutomatico() {
        openFB.login(
            function (response) {
                if (response.status === 'connected') {
                    console.log('Facebook login succeeded');
                    $ionicPopup.hide;
                    localStorage.clear();
                    localStorage.setItem('token', response.authResponse.token);
                    $rootScope.logado_facebook = true;
                    $rootScope.logado = false;
                    $state.go('app.temas')
                } else {
                    //$state.go('app.temas');
                    alert('Facebook login failed');
                }
            },
            { scope: 'email,publish_actions' });
    }
})

.controller('MenuLateralCtrl', function ($scope, $state, $ionicPopup, $ionicHistory, $rootScope) {
    $scope.logout = function () {
        $ionicHistory.clearCache(); //LIMPAR TODAS AS VIEWS DO APP
        if ($rootScope.logado_facebook) { //USUARIO FACEBOOK
            window.sessionStorage['fbtoken'] = localStorage.getItem('token');
            openFB.logout(
              function () {
                  // Do something to logout from your app or redirect to page after logout.
                  //Necessário remover o token para permitir o login automatico do face caso já tenha credenciais armazenadas.
                  localStorage.setItem('token', null);
                  //$ionicHistory.clearCache();
                  setTimeout(function () {
                      window.close();
                      $state.go('login');
                      $ionicPopup.alert({
                          title: 'Disconnected!',
                          template: ''
                      });
                  }, 700);
              }
            );
        }
        else if ($rootScope.logado) { //USUARIO COMUM
            //FALTA IMPLEMENTAR
            $state.go('login');
        } else {
            $state.go('login');
        }

    }
})

.controller('TemasCtrl', function ($scope, $rootScope, $ionicHistory) {
    //$ionicHistory.clearHistory();
    //Obtem informacoes do facebook do usuario, assim que entra logo na PRIMEIRA tela.
    if ($rootScope.logado_facebook) {
        openFB.api({
            path: '/me',
            params: { fields: 'id,name,email' },
            success: function (user) {
                $scope.$apply(function () {
                    $rootScope.user = user;
                    //document.getElementsByTagName("img")[0].setAttribute("src", "http://graph.facebook.com/" + user.id + "/picture?width=170&height=170");
                });
            },
            error: function (error) {
                alert('Facebook error: ' + error.error_description);
            }
        });
    }

    //var usuario = $rootScope.user;
    //if (angular.isUndefined(usuario)) {
    //    $scope.usuario = "convidado";
    //} else {
    //    $scope.usuario = usuario.name;
    //}

    $scope.temas = [
  { nome: 'Random', id: 1 },
    { nome: 'Restaurant', id: 2 },
    { nome: 'Occupation', id: 3 },
    { nome: 'Current News', id: 4 }
    ];
})

.controller('TabuleiroCtrl', function ($scope, $stateParams, $timeout, $ionicPopup, $state, $compile, $ionicHistory, $ionicLoading) {

    //PENDÊNCIAS TELA TABULEIRO:

    //    - COLOCAR TAMANHAO FIXO DAS CELULAS (TD)
    //    - CELULA DEVE ACEITAR UM CARACTER APENAS
    //    - COLOCAR NUMERACAO DAS PALAVRAS NO CANTO SUPERIOR ESQUERDO DA CELULA
    //    - LARGURA E ALTURA COM BASE NO TAMANHO DA TELA DO APARELHO (30PX)
    //    - MODO DALTONICO  
    //    - PONTUACAO
    //    - LAYOUT

    //    - VER RESPOSTA INDIVIDUAL - ok  
    //    - CRIAR TIMER - ok
    //    - TRAVAR TELA APARELHO POSICAO VERTICAL - ok
    //    - VERBALIZAR DICAS - ok
    //    - VERBALIZAR RESPOSTA INDIVIDUAL - ok 


    //DESEJOS:
    //    - ANIMACOES E SONS NA CRIACAO DAS CELULAS (HTML5?)

    var devicePixelRatio = window.devicePixelRatio;
    var tamanho = (screen.width * devicePixelRatio) / 30;
    //var LARGURA_GRADE = Math.floor(tamanho);
    //var ALTURA_GRADE = Math.floor(tamanho);
    var LARGURA_GRADE = 60;
    var ALTURA_GRADE = 60;
    var EMPTYCHAR = '';
    var activeWordList = []; //lista das palavras inseridas na grade
    var coordList = [];
    var grid;

    function board(cols, rows) {
        this.cols = cols;
        this.rows = rows;

        var acrossCount = 0;
        var downCount = 0;
        var placeOrder = 0;

        grid = new Array(cols); //cria uma matriz para a grade das letras
        for (var i = 0; i < rows; i++) {
            grid[i] = new Array(rows);
        }

        for (var x = 0; x < cols; x++) {
            for (var y = 0; y < rows; y++) {
                grid[x][y] = {};
                grid[x][y].targetChar = EMPTYCHAR; //target character, hidden
                grid[x][y].indexDisplay = ''; //não está sendo usado - used to display index number of word start 
                grid[x][y].value = '-'; //actual current letter shown on board
            }
        }

        function suggestCoords(word) { //search for potential cross placement locations
            var c = '';
            coordCount = [];
            coordCount = 0;
            for (i = 0; i < word.length; i++) { //cycle through each character of the word
                for (x = 0; x < ALTURA_GRADE; x++) {
                    for (y = 0; y < LARGURA_GRADE; y++) {
                        c = word[i];
                        if (grid[x][y].targetChar == c) { //check for letter match in cell
                            if (x - i + 1 > 0 && x - i + word.length - 1 < ALTURA_GRADE) { //encaixa verticalmente?
                                coordList[coordCount] = {};
                                coordList[coordCount].x = x - i;
                                coordList[coordCount].y = y;
                                coordList[coordCount].score = 0;
                                coordList[coordCount].vertical = true;
                                coordCount++;
                            }

                            if (y - i + 1 > 0 && y - i + word.length - 1 < LARGURA_GRADE) { //encaixa horizontalmente?
                                coordList[coordCount] = {};
                                coordList[coordCount].x = x;
                                coordList[coordCount].y = y - i;
                                coordList[coordCount].score = 0;
                                coordList[coordCount].vertical = false;
                                coordCount++;
                            }
                        }
                    }
                }
            }
        }

        function checkFitScore(word, x, y, vertical) { // verifica o score para melhor alocação das palavras
            var fitScore = 2; //default is 1, 2+ has crosses, 0 is invalid due to collision

            if (vertical) { //verificação vertical
                for (i = 0; i < word.length; i++) {
                    if (i == 0 && x > 0) { //check for empty space preceeding first character of word if not on edge
                        if (grid[x - 1][y].targetChar != EMPTYCHAR) { //adjacent letter collision
                            fitScore = 0;
                            break;
                        }
                    } else if (i == word.length && x < ALTURA_GRADE) {
                        if (grid[x + i + 1][y].targetChar != EMPTYCHAR) {
                            fitScore = 0;
                            break;
                        }
                    }
                    if (x + i < ALTURA_GRADE) {
                        if (grid[x + i][y].targetChar == word[i]) {
                            fitScore += 1;
                        } else if (grid[x + i][y].targetChar != EMPTYCHAR) {
                            fitScore = 0;
                            break;
                        } else {
                            if (y < LARGURA_GRADE - 1) {
                                if (grid[x + i][y + 1].targetChar != EMPTYCHAR) {
                                    fitScore = 0;
                                    break;
                                }
                            }
                            if (y > 0) {
                                if (grid[x + i][y - 1].targetChar != EMPTYCHAR) {
                                    fitScore = 0;
                                    break;
                                }
                            }
                        }
                    }

                }

            } else { //verificação horizontal
                for (i = 0; i < word.length; i++) {
                    if (i == 0 && y > 0) {
                        if (grid[x][y - 1].targetChar != EMPTYCHAR) {
                            fitScore = 0;
                            break;
                        }
                    } else if (i == word.length - 1 && y + i < LARGURA_GRADE - 1) {
                        if (grid[x][y + i + 1].targetChar != EMPTYCHAR) {
                            fitScore = 0;
                            break;
                        }
                    }
                    if (y + i < LARGURA_GRADE) {
                        if (grid[x][y + i].targetChar == word[i]) {
                            fitScore += 1;
                        } else if (grid[x][y + i].targetChar != EMPTYCHAR) {
                            fitScore = 0;
                            break;
                        } else {
                            if (x < ALTURA_GRADE) {
                                if (grid[x + 1][y + i].targetChar != EMPTYCHAR) {
                                    fitScore = 0;
                                    break;
                                }
                            }
                            if (x > 0) {
                                if (grid[x - 1][y + i].targetChar != EMPTYCHAR) {
                                    fitScore = 0;
                                    break;
                                }
                            }
                        }
                    }

                }
            }
            return fitScore;
        }

        function alocarPalavra(word, clue, x, y, vertical) { //aloca a palavra na grade

            var wordPlaced = false;

            if (vertical) {
                if (word.length + x < ALTURA_GRADE) {
                    for (i = 0; i < word.length; i++) {
                        if (i == 0) { //verificação para adicionar ordem de inserção 
                            placeOrder = placeOrder + 1;
                            grid[x + i][y].targetChar = placeOrder + "placeOrder " + word[i].toLowerCase();
                            //grid[x + i][y].targetChar = word[i];
                            //grid[x + i][y].placeOrder = placeOrder;
                        } else {
                            grid[x + i][y].targetChar = word[i];
                            //grid[x + i][y].placeOrder = '';
                        }
                    }
                    wordPlaced = true;
                }
            } else {
                if (word.length + y < LARGURA_GRADE) {
                    for (i = 0; i < word.length; i++) {
                        if (i == 0) { //verificação para adicionar ordem de inserção 
                            placeOrder = placeOrder + 1;
                            grid[x][y + i].targetChar = placeOrder + "placeOrder " + word[i].toLowerCase();
                            //grid[x][y + i].targetChar = word[i];
                            //grid[x][y + i].placeOrder = placeOrder;
                        } else {
                            grid[x][y + i].targetChar = word[i].toLowerCase();
                            //grid[x][y + i].placeOrder = '';
                        }
                    }
                    wordPlaced = true;
                }
            }

            if (wordPlaced) {
                var currentIndex = activeWordList.length;
                activeWordList[currentIndex] = {};
                activeWordList[currentIndex].word = word.toLowerCase();
                activeWordList[currentIndex].clue = clue;
                activeWordList[currentIndex].x = x;
                activeWordList[currentIndex].y = y;
                activeWordList[currentIndex].vertical = vertical;
                activeWordList[currentIndex].placeOrder = placeOrder;

                if (activeWordList[currentIndex].vertical) {
                    downCount++;
                    activeWordList[currentIndex].number = downCount;
                } else {
                    acrossCount++;
                    activeWordList[currentIndex].number = acrossCount;
                }
            }

        }

        function isActiveWord(word) {
            if (activeWordList.length > 0) {
                for (var w = 0; w < activeWordList.length; w++) {
                    if (word == activeWordList[w].word) {
                        //console.log(word + ' in activeWordList');
                        return true;
                    }
                }
            }
            return false;
        }

        function shuffleArray(array) {
            var currentIndex = array.length,
                temporaryValue, randomIndex;

            while (0 !== currentIndex) {

                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }

            return array;
        }

        this.mostrarGrade = function mostrarGrade() {
            var element;
            var id;
            var rowStr = "";
            for (var x = 0; x < cols; x++) {
                for (var y = 0; y < rows; y++) {
                    if (grid[x][y].targetChar != "") {
                        id = x + "." + y;
                        if (grid[x][y].targetChar.indexOf("placeOrder") >= 0) {
                            element = grid[x][y].targetChar.replace("placeOrder", ".");
                            element = element.split(".")[0];
                            rowStr += "<td id='" + id + "' bgcolor='white' style='width:30px' contenteditable='true'>" + element + "</td>";
                            //rowStr += "<td id='" + id + "'onclick='verificarValor(" + x + "," + y + "," + "&quot;" + grid[x][y].targetChar + "&quot;)' bgcolor='white' style='width:30px' contenteditable='true'>" + element + "</td>";
                        } else {
                            rowStr += "<td id='" + id + "' bgcolor='white' style='width:30px' contenteditable='true'></td>";
                            //rowStr += "<td id='" + id + "'onclick='verificarValor(" + x + "," + y + "," + "&quot;" + grid[x][y].targetChar + "&quot;)' bgcolor='white' style='width:30px' contenteditable='true'></td>";
                            //rowStr += "<td  onclick='verificarValor(" + x + "," + y + "," + "&quot;" + grid[x][y].targetChar + "&quot;)' bgcolor='white' style='width:30px' contenteditable='true'>" + grid[x][y].targetChar.toUpperCase() + "</td>";
                        }
                    } else {
                        rowStr += "<td bgcolor='black' style='border:0px width:0px'></td>";
                    }
                }
                document.getElementById('crossTable').innerHTML += "<tr bgcolor='white'>" + rowStr + "</tr>";
                rowStr = "";
            }

            console.log('across ' + acrossCount);
            console.log('down ' + downCount);

            var downText = "HORIZONTAL: " + "<br />";
            var acrossText = "VERTICAL: " + "<br />";
            var dica = ""; var resposta = ""; var exibirResposta = "";
            if (activeWordList.length > 0) {
                for (var w = 0; w < activeWordList.length; w++) {
                    if (activeWordList[w].vertical == true) {
                        //dica = "<button ng-click='speak(&quot;" + activeWordList[w].clue + "&quot;)'>Verbalizar dica</button> ";
                        //resposta = "<button ng-click='speak(&quot;" + activeWordList[w].word + "&quot;)'>Verbalizar resposta</button> ";
                        dica = "<button ng-click='speak(" + w + "," + 1 + ")'>Verbalizar dica</button> ";
                        resposta = "<button ng-click='speak(" + w + "," + 2 + ")'>Verbalizar resposta</button> ";
                        exibirResposta = "<button ng-click='alertResposta(" + w + ")'>Ver resposta</button> ";
                        acrossText = acrossText + activeWordList[w].placeOrder + ". " + activeWordList[w].clue + dica + resposta + exibirResposta + "<br /><br />";
                    } else {
                        //dica = "<button ng-click='speak(&quot;" + activeWordList[w].clue + "&quot;)'>Verbalizar dica</button> ";
                        //resposta = "<button ng-click='speak(&quot;" + activeWordList[w].word + "&quot;)'>Verbalizar resposta</button> ";
                        dica = "<button ng-click='speak(" + w + "," + 1 + ")'>Verbalizar dica</button> ";
                        resposta = "<button ng-click='speak(" + w + "," + 2 + ")'>Verbalizar resposta</button> ";
                        exibirResposta = "<button ng-click='alertResposta(" + w + ")'>Ver resposta</button> ";
                        downText = downText + activeWordList[w].placeOrder + ". " + activeWordList[w].clue + dica + resposta + exibirResposta +  "<br /><br />";
                    }
                }
            }

            //document.getElementById('someStuff').innerHTML = "<div ng-controller='sheet'>{{stuff}}</div>";
            //$compile(document.getElementById('someStuff'))($scope);

            //document.getElementById('div1').innerHTML = downText + acrossText;
            //$compile(document.getElementById('div1'))($scope);
        }

        $scope.alertResposta = function (index) {
            //activeWordList[index].word
            $ionicPopup.alert({
                title: activeWordList[index].word,
                template: ''
            });

        }

        this.gerarGrade = function gerarGrade() {

            var bestScoreIndex = 0;
            var top = 0;
            var fitScore = 0;
            var startTime;
            var wordArray = [{
                "word": "SAFFRON",
                "clue": "The dried, orange yellow plant used to as dye and as a cooking spice."
            }, {
                "word": "caramel",
                "clue": "A smooth chery candy made from suger, butter, cream or milk with flavoring."
            }, {
                "word": "pumpernickel",
                "clue": "Dark, sour bread made from coarse ground rye."
            }, {
                "word": "leaven",
                "clue": "An agent, such as yeast, that cause batter or dough to rise.."
            }, {
                "word": "coda",
                "clue": "Musical conclusion of a movement or composition."
            }, {
                "word": "paladin",
                "clue": "A heroic champion or paragon of chivalry."
            }, {
                "word": "syncopation",
                "clue": "Shifting the emphasis of a beat to the normally weak beat."
            }, {
                "word": "albatross",
                "clue": "A large bird of the ocean having a hooked beek and long, narrow wings."
            }, {
                "word": "harp",
                "clue": "Musical instrument with 46 or more open strings played by plucking."
            }, {
                "word": "piston",
                "clue": "A solid cylinder or disk that fits snugly in a larger cylinder and moves under pressure as in an engine."
            }, {
                "word": "coral",
                "clue": "A rock-like deposit of organism skeletons that make up reefs."
            }, {
                "word": "dawn",
                "clue": "The time of each morning at which daylight begins."
            }, {
                "word": "pitch",
                "clue": "A resin derived from the sap of various pine trees"
            }, {
                "word": "fjord",
                "clue": "A long, narrow, deep inlet of the sea between steep slopes."
            }, {
                "word": "lip",
                "clue": "Either of two fleshy folds surrounding the mouth."
            }, {
                "word": "lime",
                "clue": "The egg-shaped citrus fruit having a green coloring and acidic juice."
            }, {
                "word": "mist",
                "clue": "A mass of fine water droplets in the air near or in contact with the ground."
            }, {
                "word": "plague",
                "clue": "A widespread affliction or calamity."
            }, {
                "word": "yarn",
                "clue": "A strand of twisted threads or a long elaborate narrative."
            }, {
                "word": "house",
                "clue": "Place where people live."
            }, {
                "word": "dog",
                "clue": "Man's best friend"
            }, {
                "word": "airplane",
                "clue": "Transport"
            }];

            //manually place the longest word horizontally at 0,0
            alocarPalavra(wordArray[0].word, wordArray[0].clue, 0, 0, false);

            //attempt to fill the rest of the board 
            var FIT_ATTEMPTS = 100
            for (var iy = 0; iy < FIT_ATTEMPTS; iy++) { //usually 2 times is enough for max fill potential
                for (var ix = 1; ix < wordArray.length; ix++) {
                    if (!isActiveWord(wordArray[ix].word)) { //only add if not already in the active word list
                        topScore = 0;
                        bestScoreIndex = 0;

                        suggestCoords(wordArray[ix].word); //fills coordList and coordCount
                        coordList = shuffleArray(coordList); //adds some randomization

                        if (coordList[0]) {
                            for (c = 0; c < coordList.length; c++) { //get the best fit score from the list of possible valid coordinates
                                fitScore = checkFitScore(wordArray[ix].word, coordList[c].x, coordList[c].y, coordList[c].vertical);
                                if (fitScore > topScore) {
                                    topScore = fitScore;
                                    bestScoreIndex = c;
                                }
                            }
                        }

                        if (topScore > 1) { //only place a word if it has a fitscore of 2 or higher

                            alocarPalavra(wordArray[ix].word, wordArray[ix].clue, coordList[bestScoreIndex].x, coordList[bestScoreIndex].y, coordList[bestScoreIndex].vertical);
                        }
                    }

                }
            }
        }
    }

    $scope.alimentarGrade = function () {

        gameboard = new board(LARGURA_GRADE, ALTURA_GRADE);
        gameboard.gerarGrade();
        gameboard.mostrarGrade();
        //CreateTimer("timer", 30);
    }

    var correcaoList = [];
    var t = "";
    var palavrasCorretas = 0;
    var palavrasIncorretas = 0;

    $scope.corrigir = function () {
        if (activeWordList.length > 0) {
            for (var w = 0; w < activeWordList.length; w++) { //activeWordList[w].vertical == true) {
                corrigirPalavra(activeWordList[w].x, activeWordList[w].y, activeWordList[w].vertical, activeWordList[w].word)
            }
            $ionicPopup.alert({
                title: "Palavras Corretas: " + palavrasCorretas + " <br> " + "Palavras Incorretas: " + palavrasIncorretas + " <br> " + "Total de palavras: " + activeWordList.length,
                template: ''
            });
            palavrasCorretas = 0;
            palavrasIncorretas = 0;
        }
    }

    function corrigirPalavra(x, y, vertical, word) {
        var xCont = 0;
        var yCont = 0;
        if (vertical) {
            for (i = 0; i < word.length; i++) {
                xCont = x + i;
                t = t + document.getElementById(xCont + '.' + y).innerText.replace("placeOrder", "").replace(" ", "").replace(/[0-9]/g, '').trim().toLowerCase();
                //t = t + grid[x + i][y].targetChar.replace("placeOrder", "").replace(" ", "").replace(/[0-9]/g, '').trim().toLowerCase();
            }
            var currentIndex = correcaoList.length;
            correcaoList[currentIndex] = {};
            correcaoList[currentIndex].palavra = t;
            correcaoList[currentIndex].vertical = true;
            if (word == t) {
                palavrasCorretas++;
                xCont = 0;
                for (i = 0; i < word.length; i++) {
                    xCont = x + i;
                    document.getElementById(xCont + '.' + y).style.backgroundColor = "green";
                }
            } else {
                xCont = 0;
                palavrasIncorretas++;
                for (i = 0; i < word.length; i++) {
                    xCont = x + i;
                    if (document.getElementById(xCont + '.' + y).style.backgroundColor != "green") {
                        document.getElementById(xCont + '.' + y).style.backgroundColor = "red";
                    }
                }
            }

        } else {
            for (i = 0; i < word.length; i++) {
                yCont = y + i
                t = t + document.getElementById(x + '.' + yCont).innerText.replace("placeOrder", "").replace(" ", "").replace(/[0-9]/g, '').trim().toLowerCase();
                //t = t + grid[x][y + i].targetChar.replace("placeOrder", "").replace(" ", "").replace(/[0-9]/g, '').trim().toLowerCase();
            }
            var currentIndex = correcaoList.length;
            correcaoList[currentIndex] = {};
            correcaoList[currentIndex].palavra = t;
            correcaoList[currentIndex].vertical = false;
            if (word == t) {
                palavrasCorretas++;
                yCont = 0;
                for (i = 0; i < word.length; i++) {
                    yCont = y + i
                    document.getElementById(x + '.' + yCont).style.backgroundColor = "green";
                }
            } else {
                palavrasIncorretas++;
                yCont = 0;
                for (i = 0; i < word.length; i++) {
                    yCont = y + i
                    if (document.getElementById(x + '.' + yCont).style.backgroundColor != "green") {
                        document.getElementById(x + '.' + yCont).style.backgroundColor = "red";
                    }

                }
            }
        }
        t = "";
    }

    $scope.exibirRespostas = function () {
        var element;
        for (var x = 0; x < ALTURA_GRADE; x++) {
            for (var y = 0; y < LARGURA_GRADE; y++) {
                if (grid[x][y].targetChar != "") {
                    id = x + "." + y;
                    element = grid[x][y].targetChar.replace("placeOrder", ".").toUpperCase();
                    document.getElementById(x + '.' + y).innerText = element;
                }
            }
        }
    }

    $scope.limparGrade = function () {
        var element;
        for (var x = 0; x < ALTURA_GRADE; x++) {
            for (var y = 0; y < LARGURA_GRADE; y++) {
                if (grid[x][y].targetChar != "") {
                    id = x + "." + y;
                    element = grid[x][y].targetChar.replace("placeOrder", ".").toUpperCase();
                    if (element.indexOf(".") >= 0) {
                        document.getElementById(x + '.' + y).innerText = element.split(".")[0];
                    } else {
                        document.getElementById(x + '.' + y).innerText = "";
                    }
                    document.getElementById(x + '.' + y).style.backgroundColor = "white"
                }
            }
        }
    }

    $scope.verificarValor = function (x, y, letra) {
        //alert(x + " " + y + " " + letra);
    }

    ///////////////////////////////////////////////////////////////////////////////// TIMER
    var mytimeout;
    var timerCount = 1000; // em segundos
    function timer() {
        if (timerCount < 0) {
            //Tempo acabou
            //var o = $ionicHistory.currentView();
            //if (o.stateName == "app.tabuleiro") {
            var alertPopup = $ionicPopup.alert({
                title: 'Seu tempo acabou!!!',
                template: ''
            });
            alertPopup.then(function (res) {
                $state.go('app.temas');
            });

            //}

        } else {
            var hours = parseInt(timerCount / 3600) % 24;
            var minutes = parseInt(timerCount / 60) % 60;
            var seconds = timerCount % 60;
            var result = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
            $scope.timer = result;
            timerCount--;
            mytimeout = $timeout(timer, 1000);
        }
    };
    $scope.timer = timerCount;
    timer();

    //Funcao utilizada para parar o timer ao deixar a view
    $scope.$on('$ionicView.afterLeave', function () {
        $timeout.cancel(mytimeout);
    });

    //////////////////////////////////////////////////////////////////////////////////// VERBALIZACAO
    var dvoice = "scripts/voices/en/en-us.json";
    meSpeak.loadVoice(dvoice);
    meSpeak.loadConfig("mespeak_config.json");

    $scope.speak = function (index, tipo) {
        $ionicLoading.show({
            content: '',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
        activeWordList[index]
        
        meSpeak.stop();
        if (tipo == 1) {
            meSpeak.speak(activeWordList[index].clue, {
                amplitude: "180",
                wordgap: "0",
                pitch: "84",
                speed: "100",
                variant: "whisper"
            });
        }
        else {
            meSpeak.speak(activeWordList[index].word, {
                amplitude: "180",
                wordgap: "0",
                pitch: "84",
                speed: "100",
                variant: "whisper"
            });
        }
        

        $ionicLoading.hide();

    }


})

.controller('UserController', function ($scope, $ionicPopup, $state, $rootScope) {
    if ($rootScope.logado_facebook) {
        document.getElementsByTagName("img")[0].setAttribute("src", "http://graph.facebook.com/" + $rootScope.user.id + "/picture?width=170&height=170");
    }

    // TRANSFERIDO PARA O ONLOAD DE TEMAS
    //openFB.api({
    //    path: '/me',
    //    params: { fields: 'id,name,email' },
    //    success: function (user) {
    //        $scope.$apply(function () {
    //            $scope.user = user;
    //            document.getElementsByTagName("img")[0].setAttribute("src", "http://graph.facebook.com/" + user.id + "/picture?width=170&height=170");
    //        });
    //    },
    //    error: function (error) {
    //        alert('Facebook error: ' + error.error_description);
    //    }
    //});

    $scope.share = function () {
        if ($rootScope.logado_facebook) {
            openFB.api({
                method: 'POST',
                path: '/me/feed',
                params: {
                    message: "Esta mensagem: 'Test App', está sendo compartilhada"
                },
                success: function () {
                    $ionicPopup.alert({
                        title: 'Compartilhado com sucesso!',
                        template: ''
                    });
                },
                error: function () {
                    alert('Ocorreu um erro ao compartilhar!');
                }
            });
        }

    }

    //FOI TRANSFERIDO PARA O MENU

    //$scope.logout = function () {
    //    window.sessionStorage['fbtoken'] = localStorage.getItem('token');
    //    openFB.logout(
    //      function () {
    //          // Do something to logout from your app or redirect to page after logout.
    //          setTimeout(function () {
    //              window.close();
    //              $state.go('login');
    //              $ionicPopup.alert({
    //                  title: 'Disconnected!',
    //                  template: ''
    //              });
    //          }, 700);
    //      }
    //    );
    //}

})

.controller('ConfiguracoesCtrl', function ($scope, $state, $ionicPopup) {
    $scope.deficiente = localStorage.getItem("deficiente");
    $scope.timer = localStorage.getItem("timer");
    $scope.verbalizar = localStorage.getItem("verbalizar");
    
    $scope.alterar = function () {
        localStorage.setItem("deficiente", $scope.deficiente);
        localStorage.setItem("timer", $scope.timer);
        localStorage.setItem("verbalizar", $scope.verbalizar);

        var alertPopup = $ionicPopup.alert({
            title: 'Configurações alteradas com sucesso!',
            template: ''
        });
        alertPopup.then(function (res) {
           
           // $state.go('app.temas');
        });


    }
});