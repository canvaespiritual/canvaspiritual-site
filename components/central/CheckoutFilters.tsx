"use client";

interface Props {

    search: string;

    onSearchChange(
        value: string,
    ): void;

    paidFilter:
        | "all"
        | "paid"
        | "pending";

    onPaidFilterChange(
        value:
            | "all"
            | "paid"
            | "pending",
    ): void;

    total: number;

}

export default function CheckoutFilters({

    search,

    onSearchChange,

    paidFilter,

    onPaidFilterChange,

    total,

}: Props) {

    return (

        <div className="mb-6 rounded-xl border border-neutral-800 bg-neutral-900 p-5">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div>

                    <h3 className="text-lg font-semibold">

                        Buscar Checkouts

                    </h3>

                    <p className="text-sm text-neutral-400">

                        {total} resultados

                    </p>

                </div>

                <div className="flex gap-3">

                    <input

                        value={search}

                        onChange={(e) =>
                            onSearchChange(
                                e.target.value,
                            )
                        }

                        placeholder="Nome, telefone ou e-mail"

                        className="w-80 rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-2 outline-none"

                    />

                    <select

                        value={paidFilter}

                        onChange={(e) =>
                            onPaidFilterChange(
                                e.target.value as
                                    | "all"
                                    | "paid"
                                    | "pending",
                            )
                        }

                        className="rounded-lg border border-neutral-700 bg-neutral-950 px-4"

                    >

                        <option value="all">

                            Todos

                        </option>

                        <option value="paid">

                            Pagos

                        </option>

                        <option value="pending">

                            Pendentes

                        </option>

                    </select>

                </div>

            </div>

        </div>

    );

}