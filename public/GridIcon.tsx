interface GridIconProps {
    fill?: boolean;
    color?: string;
    width?: number | string;
    height?: number | string;
    [key: string]: any;
}

const GridIcon: React.FC<GridIconProps> = ({
    fill = false,
    color,
    ...props
}) => {
    if (fill) {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={props.width || 24}
                height={props.height || 24}
                fill="none"
                {...props}
            >
                <path
                    fill={color || "#009DD5"}
                    stroke={color || "#009DD5"}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.25}
                    d="M9.75 4.5h-4.5c-.414 0-.75.504-.75 1.125v6.75c0 .621.336 1.125.75 1.125h4.5c.414 0 .75-.504.75-1.125v-6.75c0-.621-.336-1.125-.75-1.125ZM18.75 4.5h-4.5c-.414 0-.75.21-.75.469V7.78c0 .26.336.469.75.469h4.5c.414 0 .75-.21.75-.469V4.97c0-.26-.336-.469-.75-.469ZM9.75 16.5h-4.5c-.414 0-.75.21-.75.469v2.812c0 .26.336.469.75.469h4.5c.414 0 .75-.21.75-.469V16.97c0-.26-.336-.469-.75-.469ZM19.5 12.375c0-.621-.336-1.125-.75-1.125h-4.5c-.414 0-.75.504-.75 1.125v6.75c0 .621.336 1.125.75 1.125h4.5c.414 0 .75-.504.75-1.125v-6.75Z"
                />
            </svg>
        );
    }

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={props.width || 24}
            height={props.height || 24}
            fill="none"
            {...props}
        >
            <path
                stroke={color || "#80858A"}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.25}
                d="M9.75 4.5h-4.5c-.414 0-.75.504-.75 1.125v6.75c0 .621.336 1.125.75 1.125h4.5c.414 0 .75-.504.75-1.125v-6.75c0-.621-.336-1.125-.75-1.125ZM18.75 4.5h-4.5c-.414 0-.75.21-.75.469V7.78c0 .26.336.469.75.469h4.5c.414 0 .75-.21.75-.469V4.97c0-.26-.336-.469-.75-.469ZM9.75 16.5h-4.5c-.414 0-.75.21-.75.469v2.812c0 .26.336.469.75.469h4.5c.414 0 .75-.21.75-.469V16.97c0-.26-.336-.469-.75-.469ZM20 12.125c0-.621-.336-1.125-.75-1.125h-4.5c-.414 0-.75.504-.75 1.125v6.75c0 .621.336 1.125.75 1.125h4.5c.414 0 .75-.504.75-1.125v-6.75Z"
            />
        </svg>
    );
};

export default GridIcon;
