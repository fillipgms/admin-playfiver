import { Tour } from "nextstepjs";
import { useEffect, useState } from "react";
import { useNextStep } from "nextstepjs";

export const steps: Tour[] = [
    {
        tour: "mainTour",
        steps: [
            {
                icon: "👋",
                title: "Bem-vindo!",
                content: (
                    <>
                        <p>Seja bem-vindo ao novo painel da PlayFiver!</p>
                        <p>Vou te guiar pelas principais mudanças.</p>
                    </>
                ),
                selector: "#home-component",
                showControls: true,
                showSkip: true,
                pointerPadding: 10,
                pointerRadius: 10,
            },
            {
                icon: "",
                title: "Menu lateral",
                content: (
                    <>
                        <p>
                            Algumas páginas foram reorganizadas. Vamos conferir
                            juntos.
                        </p>
                    </>
                ),
                selector: "#sidebar",
                side: "right",
                showControls: true,
                showSkip: false,
                pointerPadding: 10,
                pointerRadius: 10,
            },
            {
                icon: "",
                title: "Página inicial",
                content: (
                    <>
                        <p>
                            Mantivemos a estrutura, mas modernizamos o visual e
                            a forma de exibir as informações.
                        </p>
                    </>
                ),
                selector: "#link-",
                side: "right",
                showControls: true,
                showSkip: false,
                pointerPadding: 10,
                pointerRadius: 10,
                nextRoute: "/agentes",
            },
            {
                icon: "",
                title: "Agentes",
                content: (
                    <>
                        <p>
                            Agora seus agentes estão apresentados de forma mais
                            clara e organizada.
                        </p>
                    </>
                ),
                selector: "#link-agentes",
                side: "right",
                showControls: true,
                showSkip: false,
                pointerPadding: 10,
                pointerRadius: 10,
                prevRoute: "/",
            },
            {
                icon: "",
                title: "Criar agente",
                content: (
                    <>
                        <p>Para adicionar um novo agente, basta clicar aqui.</p>
                    </>
                ),
                selector: "#criar-agente",
                side: "right",
                showControls: true,
                showSkip: false,
                pointerPadding: 10,
                pointerRadius: 10,
                nextRoute: "/pacotes",
            },
            {
                icon: "",
                title: "Carteiras",
                content: (
                    <>
                        <p>
                            Todos os recursos relacionados a valores foram
                            centralizados em um único lugar.
                        </p>
                    </>
                ),
                selector: "#link-pacotes",
                side: "right",
                showControls: true,
                showSkip: false,
                pointerPadding: 10,
                pointerRadius: 10,
                prevRoute: "/agentes",
            },
            {
                icon: "",
                title: "Consumo",
                content: (
                    <>
                        <p>
                            A página de consumo foi removida. Agora tudo está
                            consolidado em um só painel.
                        </p>
                    </>
                ),
                selector: "#carteira-0",
                side: "right",
                showControls: true,
                showSkip: false,
                pointerPadding: 10,
                pointerRadius: 10,
            },
            {
                icon: "",
                title: "GGR",
                content: (
                    <>
                        <p>
                            O seu GGR agora é calculado e exibido
                            automaticamente, sem necessidade de contas manuais.
                        </p>
                    </>
                ),
                selector: "#wallet-badge-1",
                side: "right",
                showControls: true,
                showSkip: false,
                pointerPadding: 10,
                pointerRadius: 10,
            },
            {
                icon: "",
                title: "Saldo e consumo",
                content: (
                    <>
                        <p>
                            O saldo aparece junto com o consumo. A barra
                            inferior mostra a progressão desde a última recarga.
                        </p>
                    </>
                ),
                selector: "#wallet-saldo-1",
                side: "right",
                showControls: true,
                showSkip: false,
                pointerPadding: 10,
                pointerRadius: 10,
            },
            {
                icon: "",
                title: "Apostas",
                content: (
                    <>
                        <p>
                            O acompanhamento das apostas ficou mais simples e
                            intuitivo.
                        </p>
                    </>
                ),
                selector: "#wallet-apostas-1",
                side: "right",
                showControls: true,
                showSkip: false,
                pointerPadding: 10,
                pointerRadius: 10,
            },
            {
                icon: "",
                title: "Consumo dos agentes",
                content: (
                    <>
                        <p>
                            Se houver agentes utilizando esta carteira, o
                            consumo deles será exibido aqui.
                        </p>
                    </>
                ),
                selector: "#wallet-agents-1",
                side: "right",
                showControls: true,
                showSkip: false,
                pointerPadding: 10,
                pointerRadius: 10,
            },
            {
                icon: "",
                title: "Influenciadores",
                content: (
                    <>
                        <p>
                            Aqui você pode adquirir e acompanhar o status dos
                            seus influenciadores em um só lugar.
                        </p>
                    </>
                ),
                selector: "#influencers-section",
                side: "top",
                showControls: true,
                showSkip: false,
                pointerPadding: 10,
                pointerRadius: 10,
            },
            {
                icon: "",
                title: "Transações",
                content: (
                    <>
                        <p>
                            Suas transações estão no mesmo local onde acompanha
                            seus gastos, facilitando a gestão.
                        </p>
                    </>
                ),
                selector: "#transactions-section",
                side: "top",
                showControls: true,
                showSkip: false,
                pointerPadding: 10,
                pointerRadius: 10,
                nextRoute: "/jogos",
            },
            {
                icon: "",
                title: "Jogos",
                content: (
                    <>
                        <p>
                            Tornamos a visualização dos jogos mais prática.
                            Basta rolar a página para explorar.
                        </p>
                    </>
                ),
                selector: "#link-jogos",
                side: "right",
                showControls: true,
                showSkip: false,
                pointerPadding: 10,
                pointerRadius: 10,
                prevRoute: "/pacotes",
            },
            {
                icon: "",
                title: "Detalhes do jogo",
                content: (
                    <>
                        <p>
                            Priorizamos o destaque visual do jogo, mas todas as
                            informações continuam disponíveis.
                        </p>
                    </>
                ),
                selector: "#game-0",
                side: "right",
                showControls: true,
                showSkip: false,
                pointerPadding: 10,
                pointerRadius: 10,
            },
            {
                icon: "",
                title: "Detalhes ao passar o mouse",
                content: (
                    <>
                        <p>
                            Ao posicionar o cursor sobre qualquer jogo, as
                            informações adicionais aparecerão automaticamente.
                        </p>
                    </>
                ),
                selector: "#info-game-0",
                side: "right",
                showControls: true,
                showSkip: false,
                pointerPadding: 10,
                pointerRadius: 10,
                nextRoute: "/jogadores",
            },
            {
                icon: "",
                title: "Jogadores",
                content: (
                    <>
                        <p>
                            A página de jogadores foi mantida, preservando a
                            familiaridade.
                        </p>
                    </>
                ),
                selector: "#link-jogadores",
                side: "right",
                showControls: true,
                showSkip: false,
                pointerPadding: 10,
                pointerRadius: 10,
                prevRoute: "/jogos",
            },
            {
                icon: "",
                title: "Informações adicionais",
                content: (
                    <>
                        <p>
                            Agora você pode visualizar informações relevantes
                            diretamente nesta página.
                        </p>
                    </>
                ),
                selector: "#jogadores-info",
                side: "right",
                showControls: true,
                showSkip: false,
                pointerPadding: 10,
                pointerRadius: 10,
                nextRoute: "/transacoes",
            },
            {
                icon: "",
                title: "Transações",
                content: (
                    <>
                        <p>
                            A página de transações foi mantida com a mesma
                            estrutura.
                        </p>
                    </>
                ),
                selector: "#link-transacoes",
                side: "right",
                showControls: true,
                showSkip: false,
                pointerPadding: 10,
                pointerRadius: 10,
                nextRoute: "/ipwhitelist",
            },
            {
                icon: "",
                title: "IP Whitelist",
                content: (
                    <>
                        <p>
                            A seção de Whitelist de IPs também permanece
                            inalterada.
                        </p>
                    </>
                ),
                selector: "#link-ipwhitelist",
                side: "right",
                showControls: true,
                showSkip: false,
                pointerPadding: 10,
                pointerRadius: 10,
                nextRoute: "/",
            },

            {
                icon: "",
                title: "Finalizando",
                content: (
                    <>
                        <p>
                            Atualizamos o visual de todo o painel para
                            proporcionar uma experiência mais moderna.
                        </p>
                        <p>
                            Em caso de dúvidas, nossa equipe de suporte está à
                            disposição.
                        </p>
                    </>
                ),
                selector: "#home-component",
                showControls: true,
                showSkip: false,
                pointerPadding: 10,
                pointerRadius: 10,
            },
        ],
    },
];

export const useFirstVisitTour = () => {
    const { startNextStep } = useNextStep();

    useEffect(() => {
        const hasVisited = localStorage.getItem("playfiver-first-visit");

        if (!hasVisited) {
            localStorage.setItem("playfiver-first-visit", "true");

            const timer = setTimeout(() => {
                startNextStep("mainTour");
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [startNextStep]);
};

export const useGameTourStep = () => {
    const { currentStep } = useNextStep();
    const [isGameStep, setIsGameStep] = useState(false);

    useEffect(() => {
        if (currentStep !== null && currentStep !== undefined) {
            const gameStepIndex = 15;
            setIsGameStep(currentStep === gameStepIndex);
        } else {
            setIsGameStep(false);
        }
    }, [currentStep]);

    return isGameStep;
};

export const useSidebarMobileTourStep = () => {
    const { currentStep } = useNextStep();
    const [isSidebarMobileStep, setIsSidebarMobileStep] = useState(false);

    useEffect(() => {
        if (currentStep !== null && currentStep !== undefined) {
            const sidebarMobileStepIndex = [1, 2, 3, 5, 13, 16, 18, 19];
            const isSidebarStep = sidebarMobileStepIndex.includes(currentStep);
            setIsSidebarMobileStep(isSidebarStep);

            if (isSidebarStep) {
                const stepToElementId: Record<number, string> = {
                    1: "sidebar",
                    2: "link-",
                    3: "link-agentes",
                    5: "link-pacotes",
                    13: "link-jogos",
                    16: "link-jogadores",
                    18: "link-transacoes",
                    19: "link-ipwhitelist",
                };

                const targetId = stepToElementId[currentStep];

                if (targetId) {
                    const timer = setTimeout(() => {
                        const el = document.getElementById(targetId);
                        el?.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                        });
                    }, 350);

                    return () => clearTimeout(timer);
                }
            }
        }
    }, [currentStep]);

    return isSidebarMobileStep;
};
