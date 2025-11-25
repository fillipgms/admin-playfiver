type User = {
    name: string;
    email: string;
    balance: string;
    currency: string;
    permissions: string[];
    roles: string[];
};

type UserAgent = {
    id: number;
    agent_memo: string;
    agent_code: string;
    agent_token: string;
    agent_secret: string;
    password: string;
    rtp: string;
    rtp_user: string;
    influencers: number;
    currency: string;
    url: string;
    bonus_enable: number;
    limit_enable: number;
    limite_amount: string;
    limit_hours: string;
    created_date: string;
};

type ProfilePayload = {
    bonus_enable: number;
    currency: string;
    limit_enable: number;
    limit_hours: string;
    limite_amount: string;
    password: string;
    rtp: string;
    url: string;
};

interface SessionPayload {
    accessToken: string;
    tokenType: string;
    expires: string;
}

interface HomeArray {
    game_name: string;
    count: number;
}

interface HomeResponse {
    user_count: string;
    agent_count: string;
    active_players: number;
    games_views: {
        [key: string]: {
            game_name: string;
            count: number;
        };
    };
    provedores_views: {
        [key: string]: {
            game_name: string;
            count: number;
        };
    };
    bets24: string;
    win24: string;
    saldoFiv: string;
}

interface Agent {
    id: number;
    agent_memo: string;
    agent_code: string;
    agent_token: string;
    agent_secret: string;
    password: string;
    rtp: string;
    rtp_user: string;
    influencers: number;
    currency: string;
    url: string;
    hide: number;
    bonus_enable?: number;
    limit_enable: number;
    limite_amount: string;
    limit_hours: string;
    created_date: string;
    usuario_name: string;
    usuario_id: number;
    usuario_email: string;
}

interface AgentResponse {
    current_page: number;
    data: Agent[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

interface GameProps {
    id: number;
    name: string;
    views: number;
    game_code: string;
    image_url: string;
    status: number;
    provedor: string;
    provedorId: number;
    original: number;
    distribuidor: string;
    distribuidorId: number;
    created_at: string;
}

interface WalletResponseProps {
    current_page: number;
    data: WalletProps[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

interface WalletProps {
    id: number;
    name: string;
    saldo: string;
    agents: WalletAgentProps[];
    status: number;
    provedores: { name: string; id: number }[];
}

interface WalletAgentProps {
    name: string;
    bet: string;
    win: string;
    total: string;
}

interface GgrTableProps {
    above: string;
    created_at: string;
    id: number;
    revendedor: number;
    tax: number;
    type: number;
    updated_at: string;
    wallet: string;
}

interface GamesResponse {
    current_page: number;
    data: GameProps[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
    provedor: Array<{
        id: number;
        name: string;
    }>;
    distribuidor: Array<{
        id: number;
        name: string;
    }>;
}

interface GamesFilters {
    page?: number;
    search?: string;
    provedor?: string[];
    typeGame?: string[];
    bonus?: string;
    carteira?: string[];
}

interface OrderResponseProps {
    current_page: number;
    data: OrderProps[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

interface OrderProps {
    id: number;
    amount: string;
    amount_add: string;
    getaway: string;
    type: string;
    expired: string | null;
    quantity: string;
    wallet: string;
    payment_id: string;
    status: number;
    created_at: string;
}

interface AgentSignature {
    id: number;
    agent_memo: string;
}

interface SignatureResponse {
    agentes: AgentSignature[];
    prices: {
        inf: string;
    };
}

interface InfluencerOrderResponse {
    id?: string | number;
    qrcode?: string;
    qrcode64?: string;
    url?: string;
}

interface TourStep {
    icon: React.ReactNode;
    title: string;
    content: React.ReactNode;
    selector: string;
    side: "top" | "bottom" | "left" | "right";
    showControls?: boolean;
    pointerPadding?: number;
    pointerRadius?: number;
    nextRoute?: string;
    prevRoute?: string;
}

interface Tour {
    tour: string;
    steps: TourStep[];
}

interface Customization {
    swiper_theme_color: string;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    background_color: string;
    text_primary_color: string;
    background_opacity: string;
    background_opacity_hover: string;
    header_color: string;
    deposit_color: string;
    gradient_color: string;
    gradient_color_to: string;
    tw_shadow: string;
    text_top_color: string;
    background_profile: string;
    text_btn_primary: string;
    color_button1: string;
    color_button2: string;
    color_button3: string;
    color_button4: string;
}

interface CustomizationResponse {
    status: number;
    data: Customization;
}

interface AdminOrderProps {
    id: number;
    user: {
        name: string;
        email: string;
    };
    wallet: string;
    amount: string;
    amount_add: string;
    getaway: string;
    type: string;
    payment_id: string;
    status: number;
    created_at: string;
}

interface AdminOrdersResponse {
    [key: string]: AdminOrderProps;
}

interface AdminSignatureProps {
    id: number;
    name: string;
    email: string;
    agent: string;
    type: string;
    quantity: string;
    expired: number;
    expired_at: string;
    status: number;
}

interface AdminSignaturesResponse {
    [key: string]: AdminSignatureProps;
}

interface AdminWalletProps {
    id: number;
    name: string;
    name_wallet: string;
    status: number;
    created_at: string | null;
    updated_at: string | null;
    description: string | null;
}

interface AdminWalletsResponse {
    [key: string]: AdminWalletProps;
}

// Distribuidores (Suppliers/Distributors)
interface DistribuidorProps {
    id: number;
    name: string;
    client_id: string;
    client_secret: string;
    extra: string;
    uri: string;
    saldo: string;
    status: number;
    views: number;
    created_at: string | null;
    updated_at: string;
    client_id_influencer: string | null;
    client_secret_influencer: string | null;
    client_extra_influencer: string | null;
}

// Provedores (Providers)
interface ProvedorProps {
    id: number;
    name: string;
    image_url: string;
    views: number;
    status: number;
    created_at: string;
    updated_at: string;
    type_wallet: number;
}

interface ProvedoresResponse {
    current_page: number;
    data: ProvedorProps[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

interface LogEntryProps {
    agente?: {
        code: string;
        memo?: string;
    };
    user?: {
        name: string;
        email: string;
    };
    gravity?: string;
    type?: string;
    data?: {
        titulo?: string;
        mensagem?: string;
        status?: number;
        body?: {
            msg?: string;
            balance?: number;
        };
    };
    created_at: string;
}

interface LogsResponse {
    data: LogEntryProps[];
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

interface RelatorioAgenteProps {
    id: number;
    agent_memo: string;
    agent_code: string;
    agent_token: string;
    agent_secret: string;
    password: string;
    rtp: string;
    rtp_user: string;
    url: string;
    hide: number;
    limit_enable: number;
    currency: string;
    limite_amount: string;
    limit_hours: string;
    influencers: number;
    created_date: string;
    usuario_name: string;
    usuario_id: number;
    usuario_email: string;
    countLogs: number;
}

interface RelatorioAgentesResponse {
    data: RelatorioAgenteProps[];
}

interface RelatorioGgrProps {
    walletName: string;
    bet: string;
    win: string;
    ggrConsumido: string;
}

interface RelatorioGgrResponse {
    [key: string]: RelatorioGgrProps;
}

interface LogsFilters {
    page?: number;
    dateStart?: string;
    dateEnd?: string;
    agent?: string[];
    user?: string[];
    gravity?: string[];
    type?: string[];
}

interface TransactionFilters {
    page?: number;
    dateStart?: string;
    dateEnd?: string;
    agent?: string;
    search?: string;
}

interface ConfiguracoesProps {
    id: number;
    limit_enable: number;
    limite_amount: string;
    limit_hours: string;
    created_at: string | null;
    updated_at: string;
    maintenance_panel: number;
    maintenance_api: number;
    limit_enable_distribuidor: number;
    limite_amount_distribuidor: string;
    limit_hours_distribuidor: string;
    limit_max_distribuidor: string;
    limit_max: string;
    limit_hours_bonus: number;
    limit_quantity_bonus: number;
    number_of_hours: number;
    quantity_rounds_free: number;
    ezzepay_client_id: string;
    ezzepay_client_secret: string;
    ezzepay_user: string;
    ezzepay_senha: string;
    ezzepay_uri: string;
    suitpay_client_id: string;
    suitpay_client_secret: string;
    suitpay_uri: string;
    primary: string;
    nowpayment_uriNow: string;
    nowpayment_id: string;
    nowpayment_secretNow: string;
    digitopay_uri: string;
    digitopay_cliente_id: string;
    digitopay_cliente_secret: string;
    digitopay_id_conta: string;
}

interface UserResponseProps {
    current_page: number;
    data: UserProps[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

interface UserProps {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    ban: number;
    saldo: number;
    created_at: string;
    updated_at: string;
    google2fa_secret: string | null;
    verify_google2fa: string | number | null;
    latest_ip: string | null;
    verification_code: string | null;
    wallets: UserWalletProps[];
    role: string[];
    limit: boolean;
    limits: {
        limit_amount?: string;
        limit_hours?: string;
    } | null;
}

interface UserWalletProps {
    wallet: string;
    saldo: string;
    id: string;
    status: number;
}

interface SpecificUserResponseProps {
    status: 1 | 0;
    data: SpecificUserDataProps;
    error: string | null;
}

interface SpecificUserDataProps {
    user: SpecificUserProps[];
    agentesCount: number;
    agentesSumWin: string;
    agentesSumBet: string;
    agentesSumWin24: string;
    agentesSumBet24: string;
    total: string;
    totalFichasAdd: string;
    totalFichas: string;
    agentes: SpecificUserAgent[];
    orders: SpecificUserOrder[];
    ip: string | null;
    ipRelations: string | null;
    role: string[];
    wallets: SpecifcUserWallet[];
}

interface SpecificUserAgent {
    id: number;
    rtp: string;
    url: string;
    rtp_user: string;
    agent_code: string;
    limit_hours: string;
    bonus_enable: number;
    created_date: string;
    limit_enable: number;
    limite_amount: number;
}

interface SpecificUserOrder {
    id: number;
    amount: number;
    status: number;
    getaway: string;
    amount_add: number;
    created_at: string;
    payment_id: string;
    type_wallet: string | null;
}

interface SpecifcUserWallet {
    wallet: string;
    saldo: string;
    id: number;
}

interface SpecificUserProps {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
    ban: number;
    created_at: string;
    updated_at: string;
    google2fa_secret: string;
    verify_google2fa: string;
    latest_ip: string;
    verification_code: string | null;
    agentes: string;
    agentesCount: number;
    totalFichas: string;
    agentesSumWin: string | null;
    agentesSumBet: string | null;
    agentesSumWin24: string | null;
    agentesSumBet24: string | null;
    ordersTotal: string | null;
    fichasTotal: string | null;
    orders: string;
    ip: string | null;
    ipRelations: ipRelationProps[] | null;
    role: string[];
}

interface ipRelationProps {
    id: number;
    name: string;
    email: string;
}

interface SettingsResponse {
    status: number;
    data: ConfiguracoesProps;
    msg: string;
}

interface SettingsProps {
    id: number;
    limit_enable: number;
    limite_amount: string;
    limit_hours: string;
    created_at: string | null;
    updated_at: string;
    maintenance_panel: number;
    maintenance_api: number;
    limit_enable_distribuidor: number;
    limite_amount_distribuidor: string;
    limit_hours_distribuidor: string;
    limit_max_distribuidor: string;
    limit_max: string;
    limit_hours_bonus: number;
    limit_quantity_bonus: number;
    number_of_hours: number;
    quantity_rounds_free: number;
    ezzepay_client_id: string;
    ezzepay_client_secret: string;
    ezzepay_user: string;
    ezzepay_senha: string;
    ezzepay_uri: string;
    suitpay_client_id: string;
    suitpay_client_secret: string;
    suitpay_uri: string;
    primary: string;
    nowpayment_uriNow: string;
    nowpayment_id: string;
    nowpayment_secretNow: string;
    digitopay_uri: string;
    digitopay_cliente_id: string;
    digitopay_cliente_secret: string;
    digitopay_id_conta: string;
}

interface UsersFilters {
    page?: number;
    search?: string;
    role?: string[];
    filter?: string;
}
