"use client";

import {
  useMemo,
  useState,
} from "react";

import CheckoutDetails from "./CheckoutDetails";
import CheckoutFilters from "./CheckoutFilters";
import CheckoutTable from "./CheckoutTable";
import StandaloneSaleForm from "./StandaloneSaleForm";

import type { CheckoutLead } from "@/types/checkout";

interface CheckoutListClientProps {
  checkouts: CheckoutLead[];
}

export default function CheckoutListClient({
  checkouts,
}: CheckoutListClientProps) {
  const [search, setSearch] =
    useState("");

  const [
    paidFilter,
    setPaidFilter,
  ] =
    useState<
      "all" | "paid" | "pending"
    >("all");

  const [
    selectedCheckout,
    setSelectedCheckout,
  ] =
    useState<CheckoutLead | null>(
      null,
    );

  const [
    showStandaloneSale,
    setShowStandaloneSale,
  ] = useState(false);

  const filteredCheckouts =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLocaleLowerCase(
            "pt-BR",
          );

      return checkouts.filter(
        (checkout) => {
          const searchableContent =
            [
              checkout.name,
              checkout.email,
              checkout.phone,
              checkout.campaignDisplayName ??
                "",
              checkout.campaignId ??
                "",
              checkout.utmSource ??
                "",
              checkout.utmMedium ??
                "",
            ]
              .join(" ")
              .toLocaleLowerCase(
                "pt-BR",
              );

          const matchesSearch =
            !normalizedSearch ||
            searchableContent.includes(
              normalizedSearch,
            );

          const matchesPayment =
            paidFilter === "all" ||
            (paidFilter ===
              "paid" &&
              checkout.paid) ||
            (paidFilter ===
              "pending" &&
              !checkout.paid);

          return (
            matchesSearch &&
            matchesPayment
          );
        },
      );
    }, [
      checkouts,
      search,
      paidFilter,
    ]);

  function handleStandaloneSaved() {
    window.location.reload();
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div />

        <button
          type="button"
          onClick={() =>
            setShowStandaloneSale(
              (current) =>
                !current,
            )
          }
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500"
        >
          {showStandaloneSale
            ? "Fechar venda avulsa"
            : "+ Cadastrar venda avulsa"}
        </button>
      </div>

      {showStandaloneSale && (
        <div className="mb-6">
          <StandaloneSaleForm
            onSaved={
              handleStandaloneSaved
            }
            onCancel={() =>
              setShowStandaloneSale(
                false,
              )
            }
          />
        </div>
      )}

      <CheckoutFilters
        search={search}
        onSearchChange={setSearch}
        paidFilter={paidFilter}
        onPaidFilterChange={
          setPaidFilter
        }
        total={
          filteredCheckouts.length
        }
      />

      <CheckoutTable
        checkouts={
          filteredCheckouts
        }
        onOpenCheckout={
          setSelectedCheckout
        }
      />

      <CheckoutDetails
        checkout={
          selectedCheckout
        }
        onClose={() =>
          setSelectedCheckout(null)
        }
      />
    </>
  );
}